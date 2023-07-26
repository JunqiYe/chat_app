package chat_websocket

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// We'll need to define an Upgrader
// this will require a Read and Write buffer size
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type msgObj struct {
	FrameType   string `json:"type"`
	ConvID      string `json:"convID"`
	Counter     uint64 `json:"counter"`
	SenderID    string `json:"senderID"`
	RecipientID string `json:"recipientID"`
	MsgData     string `json:"msgData"`
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

func wsEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
	// upgrade this connection to a WebSocket
	// connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	log.Println("Client Connected", conn.RemoteAddr())
	if err != nil {
		log.Println(err)
	}

	client_H := NewClientHandler(conn, hub)
	go client_H.readMessage()
	go client_H.sendMessage()
}

func StartWebSocket(hub *Hub) {
	log.Println("Starting WebSocket server...")
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		wsEndpoint(hub, w, r)
	})
	log.Fatal(http.ListenAndServe(":8080", nil))
}