package apiEndpoint

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

func wsEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
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

	client_H := NewWebSocketClientHandler(conn, hub)
	go client_H.handleIncommingMessages()
	go client_H.handleOutgoingMessages()
}

func StartEndpoint(hub *Hub) {
	log.Println("Starting WebSocket server...")

	// check login information
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		httpChatIndexEndpoint(hub, w, r)
	})

	// check login information
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		httpChatLoginEndpoint(hub, w, r)
	})

	// handles the websocket connection
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		wsEndpoint(hub, w, r)
	})

	// handles the http request
	http.HandleFunc("/api/convID", func(w http.ResponseWriter, r *http.Request) {
		httpConvIDAPIEndpoint(hub, w, r)
	})

	http.HandleFunc("/api/chatHist", func(w http.ResponseWriter, r *http.Request) {
		httpChatHistAPIEndpoint(hub, w, r)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
