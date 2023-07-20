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
	FrameType string `json:"type"`
	ConvID    string `json:"convID"`
	Counter   uint64 `json:"counter"`
	SenderID  string `json:"senderID"`
	MsgData   string `json:"msgData"`
}

func debugJson(msg msgObj) {
	log.Printf("{%s}\n{%s}\n{%d}\n{%s}\n{%s}\n", msg.FrameType, msg.ConvID, msg.Counter, msg.SenderID, msg.MsgData)
}

// define a reader which will listen for
// new messages being sent to our WebSocket
// endpoint
func reader(hub *Hub, conn *websocket.Conn) {
	for {
		// read in a message
		// messageType, p, err := conn.ReadMessage()
		// if err != nil {
		// 	log.Println(err)
		// 	return
		// }
		// print out that message for clarity
		// log.Println(messageType, string(p))

		var res msgObj
		err := conn.ReadJSON(&res)
		if err != nil {
			log.Println(err)
			return
		}

		log.Println("websocket reader:")
		debugJson(res)
		if res.FrameType == "transmit" {
			hub.incommingMsg <- res
		} else {
			log.Println("new connection:", res.FrameType)
		}
		// err = conn.WriteMessage(messageType, p)
		// if err != nil {
		// 	log.Println(err)
		// 	return
		// }

	}
}

func wsEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
	// upgrade this connection to a WebSocket
	// connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	log.Println("Client Connected", conn.LocalAddr())
	if err != nil {
		log.Println(err)
	}

	// err = conn.WriteMessage(1, []byte("Hi Client!"))
	// conn.ReadMessage()
	reader(hub, conn)
}

func StartWebSocket(hub *Hub) {
	log.Println("Starting WebSocket server...")
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		wsEndpoint(hub, w, r)
	})
	log.Fatal(http.ListenAndServe(":8080", nil))
}
