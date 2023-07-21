package chat_websocket

import (
	"io"
	"log"

	"github.com/gorilla/websocket"
)

type ClientHandler struct {
	conn         *websocket.Conn
	hub          *Hub
	userID       string
	convID       string
	receipientID string
	receive      chan msgObj // msg received from other user
}

func NewClientHandler(conn *websocket.Conn, hub *Hub) *ClientHandler {
	return &ClientHandler{
		conn:         conn,
		hub:          hub,
		userID:       "",
		receipientID: "",
		convID:       "",
		receive:      make(chan msgObj, 100),
	}
}

func (c *ClientHandler) readMessage() {
	defer func() {
		c.hub.unregister <- c
	}()

	for {
		var res msgObj
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
		case "transmit":
			c.hub.incommingMsg <- res
			log.Print("msg send to hub")
		}

	}
}

func (c *ClientHandler) sendMessage() {
	for {
		dispatchMsg := <-c.receive

		err := c.conn.WriteJSON(dispatchMsg)
		if err != nil {
			log.Println(err)
			return
		}

		log.Print("dispatched msg to :", dispatchMsg.ReceipientID)
	}
}
