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
	go client_H.readMessage()
	go client_H.sendMessage()
}

func httpEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
	log.Println("new http request:", r.URL)

	switch r.Method {
	case "GET":
		q := r.URL.Query()
		userID := q.Get("userID")
		log.Println("query", userID)
		if userID != "" {
			ids := hub.storage.getAllConvIDsFromUserID(userID)
			log.Println("ids :", ids)
			w.Header().Add("Content-Type", "application/json")
			w.Header().Add("Access-Control-Allow-Origin", "*")
			w.Write(marshalDataToSend(userID, ids))
		}

		break
	case "POST":
		break

	default:
		w.WriteHeader(http.StatusBadRequest)

	}

}

func StartWebSocket(hub *Hub) {
	log.Println("Starting WebSocket server...")

	// handles the websocket connection
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		wsEndpoint(hub, w, r)
	})

	// handles the http request
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		httpEndpoint(hub, w, r)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
