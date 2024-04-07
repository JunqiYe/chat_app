package apiEndpoint

import (
	"encoding/json"
	"io"
	"log"
	"os"
	"time"

	"backend_server/internal/objects"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/gorilla/websocket"
)

func debugJson(msg objects.MsgObj) {
	log.Printf(`
	{frametype		- %s}
	{convID			- %s}
	{senderID		- %s}
	{recipientID		- %s}
	{msgData		- %s}`, msg.FrameType, msg.ConvID, msg.SenderID, msg.RecipientID, msg.MsgData)
}

type ClientHandler struct {
	conn *websocket.Conn
	// hub           *Hub
	userID string
	// dispatchBuf   chan objects.MsgObj // msg from other user, dispatch to the current client
	kafkaConsumer *kafka.Consumer
	kafkaProducer *kafka.Producer
}

func NewWebSocketClientHandler(conn *websocket.Conn) *ClientHandler {
	c, err := kafka.NewConsumer((&kafka.ConfigMap{
		"bootstrap.servers": "localhost:9092,localhost:9092",
		"group.id":          "foo",
		"auto.offset.reset": "smallest"}))

	if err != nil {
		log.Printf("Failed to create consumer: %s", err)
		os.Exit(1)
	}

	p, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": "localhost:9092,localhost:9092",
		"client.id":         "boo",
		"acks":              "all"})

	if err != nil {
		log.Printf("Failed to create producer: %s\n", err)
		os.Exit(1)
	}

	handler := &ClientHandler{
		conn: conn,
		// hub:           nil, // deprecated
		userID: "",
		// dispatchBuf:   make(chan objects.MsgObj, 100),
		kafkaConsumer: c,
		kafkaProducer: p,
	}
	return handler
}

// incomming message from current client, route the message though hub/kafka to reach recipient
func (c *ClientHandler) handleIncommingMessages() {
	for {
		var msgObj objects.MsgObj
		err := c.conn.ReadJSON(&msgObj)
		if err != nil {
			if err == io.EOF {
				log.Println("connection closed for ", c.userID)
			} else {
				log.Println(err)
			}
			return
		}

		log.Println("websocket reader:")
		debugJson(msgObj)

		switch frameType := msgObj.FrameType; frameType {
		case "init":
			// initiate user id for the handler
			c.userID = msgObj.SenderID

			// after client userid is specified, subscribe to topic on this userid
			err = c.kafkaConsumer.SubscribeTopics([]string{c.userID}, nil)
			if err != nil {
				log.Fatalf("failed to subscribe to topic: %s", err)
			}

			go c.handleKafkaConsumerMessage()
			break

		case "transmit":
			b, err := json.Marshal(msgObj)
			if err != nil {
				log.Fatal("Failed to marshal", err)
			}

			deliveryChan := make(chan kafka.Event)
			// produce a new message to the recipient topic
			c.kafkaProducer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &msgObj.RecipientID, Partition: kafka.PartitionAny},
				Key:            nil,
				Value:          b,
			}, deliveryChan)

			go c.checkDeliveryEvent(deliveryChan, msgObj)
			break
		}

	}
}

// check the delivery channel after message is produced, if message is acknowledged from broker, relay message back to the sender
func (c *ClientHandler) checkDeliveryEvent(deliveryChan chan kafka.Event, msg objects.MsgObj) {
	defer close(deliveryChan)

	event := <-deliveryChan
	m := event.(*kafka.Message)

	if m.TopicPartition.Error != nil {
		log.Printf("Delivery failed: %v\n", m.TopicPartition.Error)

		// error occured when sending msg to Kafka, indicate error to user
		c.conn.WriteJSON(msg)
	} else {
		log.Printf("Delivered message to topic %s [%d] at offset %v\n",
			*m.TopicPartition.Topic, m.TopicPartition.Partition, m.TopicPartition.Offset)

		// successfully delivered to kafka topic
		c.conn.WriteJSON(msg)
	}

}

// Kafka Consumer, polls messages from Kafka for userID as topic id
func (c *ClientHandler) handleKafkaConsumerMessage() {
	for {
		ev, err := c.kafkaConsumer.ReadMessage(100 * time.Millisecond)

		if err != nil {
			// Errors are informational and automatically handled by the consumer
			continue
		}
		log.Printf("[Handler]: Consumed event from topic %s: key = %-10s value = %s\n",
			*ev.TopicPartition.Topic, string(ev.Key), string(ev.Value))

		// convert []byte to json
		var msgObj objects.MsgObj
		err = json.Unmarshal(ev.Value, &msgObj)
		if err != nil {
			log.Println(err)
		}

		// send the consumed message to client
		err = c.conn.WriteJSON(msgObj)
		if err != nil {
			log.Println("[handleKafkaConsumerMessage]: failed to send message,", err)
			c.kafkaConsumer.Close()
			c.kafkaProducer.Close()
			c.conn.Close()
			return
		}
	}
}
