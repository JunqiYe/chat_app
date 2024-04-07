package apiEndpoint

import (
	"backend_server/internal/objects"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Endpoint struct {
	messageStoreChan chan objects.MsgObj
	hub              *Hub
}

func NewEndpoint(messageStoreChan chan objects.MsgObj, hub *Hub) *Endpoint {
	return &Endpoint{
		messageStoreChan: messageStoreChan,
		hub:              hub,
	}
}

// We'll need to define an Upgrader
// this will require a Read and Write buffer size
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (e Endpoint) wsEndpoint(w http.ResponseWriter, r *http.Request) {
	// defer w.close()
	// upgrade this connection to a WebSocket
	// connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	log.Println("Client Connected", conn.RemoteAddr())
	if err != nil {
		log.Println(err)
		return
	}

	client_H := NewWebSocketClientHandler(conn, e.messageStoreChan)
	go client_H.handleIncommingMessages()
}

func (e Endpoint) StartEndpoint() {
	log.Println("Starting WebSocket server...")

	// check login information
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		httpChatIndexEndpoint(e.hub, w, r)
	})

	// check login information
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		httpChatLoginEndpoint(e.hub, w, r)
	})

	// handles the websocket connection
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		e.wsEndpoint(w, r)
	})

	// handles the http request
	http.HandleFunc("/api/convID", func(w http.ResponseWriter, r *http.Request) {
		httpConvIDAPIEndpoint(e.hub, w, r)
	})

	http.HandleFunc("/api/chatHist", func(w http.ResponseWriter, r *http.Request) {
		httpChatHistAPIEndpoint(e.hub, w, r)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
