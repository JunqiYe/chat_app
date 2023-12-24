package apiEndpoint

import (
	"io"
	"log"

	"backend_server/internal/objects"

	"github.com/gorilla/websocket"
)

func debugJson(msg objects.MsgObj) {
	log.Printf(`
	{frametype		- %s}
	{convID			- %s}
	{counter		- %d}
	{senderID		- %s}
	{recipientID		- %s}
	{msgData		- %s}`, msg.FrameType, msg.ConvID, msg.Counter, msg.SenderID, msg.RecipientID, msg.MsgData)
}

type ClientHandler struct {
	conn         *websocket.Conn
	hub          *Hub
	userID       string
	convID       string
	receipientID string
	dispatchBuf  chan objects.MsgObj // msg received from other user
}

func NewWebSocketClientHandler(conn *websocket.Conn, hub *Hub) *ClientHandler {
	return &ClientHandler{
		conn:         conn,
		hub:          hub,
		userID:       "",
		receipientID: "",
		convID:       "",
		dispatchBuf:  make(chan objects.MsgObj, 100),
	}
}

// incomming messages thru the websocket, parse the message and distribute to thru the hub
func (c *ClientHandler) handleIncommingMessages() {
	defer func() {
		c.hub.unregister <- c
	}()

	for {
		var res objects.MsgObj
		err := c.conn.ReadJSON(&res)
		if err != nil {
			if err == io.EOF {
				log.Println("connection closed for ", c.userID)
			} else {
				log.Println(err)
			}
			return
		}

		log.Println("websocket reader:")
		debugJson(res)

		switch frameType := res.FrameType; frameType {
		case "init":
			c.userID = res.SenderID
			c.hub.register <- c
			break

		case "transmit":
			log.Print("msg send to hub")
			c.hub.incommingMsg <- res
			break
		}

	}
}

// outgoing messages from the hub, marshal the message as json and send to the client
func (c *ClientHandler) handleOutgoingMessages() {
	for {
		dispatchMsg := <-c.dispatchBuf

		err := c.conn.WriteJSON(dispatchMsg)
		if err != nil {
			log.Println(err)
			return
		}

		log.Print("dispatched msg to :", dispatchMsg.RecipientID)
	}
}
