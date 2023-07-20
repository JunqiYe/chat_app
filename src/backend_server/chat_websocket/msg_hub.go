package chat_websocket

import (
	"log"
)

type Hub struct {
	storage       *msg_storage
	incommingMsg  chan msgObj
	conversations map[string]*ClientHandler
}

func NewHub(storage *msg_storage) *Hub {
	return &Hub{
		storage:       storage,
		incommingMsg:  make(chan msgObj),
		conversations: make(map[string]*ClientHandler),
	}
}

func (h *Hub) HubRun() {
	for {
		select {
		case msg := <-h.incommingMsg:
			(h.storage).StoreMsg(msg)
			// h.storage = append(&(h.storage), msg...)
			log.Println("Hub: new message stored", msg.ConvID, msg.MsgData)

			channel, ok := h.conversations[msg.ReceipientID]
			if ok {
				log.Println("receipient located")
				channel.receive <- msg
			}
		}
	}
}
