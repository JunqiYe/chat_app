package chat_websocket

import (
	"log"

	"github.com/gorilla/websocket"
)

type ClientHandler struct {
	conn         *websocket.Conn
	hub          *Hub
	userID       string
	convID       string
	receipientID string
	send         chan msgObj // msg sent from user
	receive      chan msgObj // msg received from other user
}

func NewClientHandler(conn *websocket.Conn, hub *Hub) *ClientHandler {
	return &ClientHandler{
		conn:         conn,
		hub:          hub,
		userID:       "",
		receipientID: "",
		convID:       "",
		send:         make(chan msgObj, 100),
		receive:      make(chan msgObj, 100),
	}
}

func (c *ClientHandler) readMessage() {
	for {
		var res msgObj
		err := c.conn.ReadJSON(&res)
		if err != nil {
			log.Println(err)
			return
		}

		log.Println("websocket reader:")
		debugJson(res)

		switch frameType := res.FrameType; frameType {
		case "init":
			c.userID = res.SenderID
			c.hub.conversations[c.userID] = c
		// case "openConv":
		// 	c.convID = res.ConvID
		case "transmit":
			c.send <- res
			c.hub.incommingMsg <- res
			log.Print("msg send to hub")
		}

	}
}

func switchSendReceiveID(msg *msgObj) {
	temp := msg.SenderID
	msg.SenderID = msg.ReceipientID
	msg.ReceipientID = temp
}

func (c *ClientHandler) SendMessage() {
	for {
		dispatchMsg := <-c.receive

		// switchSendReceiveID(&dispatchMsg)

		err := c.conn.WriteJSON(dispatchMsg)
		if err != nil {
			log.Println(err)
			return
		}

		log.Print("dispatched msg to :", dispatchMsg.ReceipientID)
	}
}
