package chat_websocket

import (
	"io"
	"log"

	"github.com/gorilla/websocket"
)

type msgObj struct {
	FrameType   string `json:"type"`
	ConvID      string `json:"convID"`
	Counter     uint64 `json:"counter"`
	SenderID    string `json:"senderID"`
	RecipientID string `json:"recipientID"`
	MsgData     string `json:"msgData"`
	TimeStamp   uint64 `json:"timeStamp"`
}

func debugJson(msg msgObj) {
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
	dispatchBuf  chan msgObj // msg received from other user
}

func NewWebSocketClientHandler(conn *websocket.Conn, hub *Hub) *ClientHandler {
	return &ClientHandler{
		conn:         conn,
		hub:          hub,
		userID:       "",
		receipientID: "",
		convID:       "",
		dispatchBuf:  make(chan msgObj, 100),
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
			break

		case "transmit":
			log.Print("msg send to hub")
			c.hub.incommingMsg <- res
			break
		}

	}
}

func (c *ClientHandler) sendMessage() {
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
