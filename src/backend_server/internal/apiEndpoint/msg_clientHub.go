package apiEndpoint

import (
	"backend_server/internal/objects"
	"backend_server/internal/store"
	"log"
)

type Hub struct {
	storage      store.StorageInterface
	incommingMsg chan objects.MsgObj
	userBase     map[string]*ClientHandler
	register     chan *ClientHandler
	unregister   chan *ClientHandler

	tokens map[string]session
}

func NewHub(storage store.StorageInterface) *Hub {
	hub := &Hub{
		storage:      storage,
		incommingMsg: make(chan objects.MsgObj),
		userBase:     make(map[string]*ClientHandler),
		register:     make(chan *ClientHandler),
		unregister:   make(chan *ClientHandler),
		tokens:       make(map[string]session),
	}

	return hub
}

// go routine for hub, handles distributing messages between client handlers
// registers and unregisters whenever a client handler connect/disconnect to the server
func (h *Hub) HubRun() {
	for {
		select {

		case handler := <-h.register:
			if _, ok := h.userBase[handler.userID]; !ok {
				h.userBase[handler.userID] = handler
			}

		case handler := <-h.unregister:
			delete(h.userBase, handler.userID)

		case msg := <-h.incommingMsg:
			if msg.FrameType == "transmit" {
				h.storage.StoreMsg(msg)
			}

			sender := msg.SenderID
			recipient := msg.RecipientID

			// check if recipient is currently connected to the server, and dispatch message
			recipientHandler, ok := h.userBase[recipient]
			if ok {
				log.Println("[Hub]: dispatch message to", recipient)
				recipientHandler.dispatchBuf <- msg

			}

			// relay the message back to sender for comfirmation message is sent
			senderHandler, ok := h.userBase[sender]
			if ok {
				log.Println("[Hub]: relay the information back to sender", sender)
				senderHandler.dispatchBuf <- msg
			}

		}
	}
}
