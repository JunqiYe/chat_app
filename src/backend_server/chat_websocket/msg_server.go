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
	FrameType    string `json:"type"`
	ConvID       string `json:"convID"`
	Counter      uint64 `json:"counter"`
	SenderID     string `json:"senderID"`
	ReceipientID string `json:"receipientID"`
	MsgData      string `json:"msgData"`
}

func debugJson(msg msgObj) {
	log.Printf(`
	{frametype		- %s}
	{convID			- %s}
	{counter		- %d}
	{SenderID		- %s}
	{ReceipientID		- %s}
	{msgData		- %s}`, msg.FrameType, msg.ConvID, msg.Counter, msg.SenderID, msg.ReceipientID, msg.MsgData)
}

// define a reader which will listen for
// new messages being sent to our WebSocket
// endpoint
func reader(hub *Hub, conn *websocket.Conn) {
	// for {
	// 	// read in a message
	// 	// messageType, p, err := conn.ReadMessage()
	// 	// if err != nil {
	// 	// 	log.Println(err)
	// 	// 	return
	// 	// }
	// 	// print out that message for clarity
	// 	// log.Println(messageType, string(p))

	// 	var res msgObj
	// 	err := conn.ReadJSON(&res)
	// 	if err != nil {
	// 		log.Println(err)
	// 		return
	// 	}

	// 	log.Println("websocket reader:")
	// 	debugJson(res)

	// 	if res.FrameType == "init" {
	// 		hub.conversations[res.ConvID] = conn
	// 	}
	// 	if res.FrameType == "transmit" {
	// 		hub.incommingMsg <- res
	// 	} else {
	// 		log.Println("new connection:", res.FrameType)
	// 	}
	// 	// err = conn.WriteMessage(messageType, p)
	// 	// if err != nil {
	// 	// 	log.Println(err)
	// 	// 	return
	// 	// }

	// }
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

	// err = conn.WriteMessage(1, []byte("Hi Client!"))
	// conn.ReadMessage()
	client_H := NewClientHandler(conn, hub)
	go client_H.readMessage()
	go client_H.SendMessage()
	// reader(hub, conn)
}

func StartWebSocket(hub *Hub) {
	log.Println("Starting WebSocket server...")
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		wsEndpoint(hub, w, r)
	})
	log.Fatal(http.ListenAndServe(":8080", nil))
}
