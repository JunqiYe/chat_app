package chat_websocket

import (
	"log"
)

type Hub struct {
	storage       *msg_storage
	incommingMsg  chan msgObj
	conversations map[string]*ClientHandler
	register      chan *ClientHandler
	unregister    chan *ClientHandler
}

func NewHub(storage *msg_storage) *Hub {
	return &Hub{
		storage:       storage,
		incommingMsg:  make(chan msgObj),
		conversations: make(map[string]*ClientHandler),
		register:      make(chan *ClientHandler),
		unregister:    make(chan *ClientHandler),
	}
}

func (h *Hub) HubRun() {
	for {
		select {

		case handler := <-h.register:
			h.conversations[handler.userID] = handler

		case handler := <-h.unregister:
			delete(h.conversations, handler.userID)

		case msg := <-h.incommingMsg:
			h.storage.StoreMsg(msg)

			channel, ok := h.conversations[msg.RecipientID]
			if ok {
				log.Println("receipient located")
				channel.receive <- msg
			}
		}
	}
}
