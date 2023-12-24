package apiEndpoint

import (
	"backend_server/internal/objects"
	storeAdapter "backend_server/internal/store/storeAdaptor"
	"log"
)

type Hub struct {
	storage                  storeAdapter.StorageInterface
	incommingMsg             chan objects.MsgObj
	conversations            map[string]map[string]bool // conversationID -> clientsID
	conversation_msg_counter map[string]uint64          // conversation
	userBase                 map[string]*ClientHandler
	register                 chan *ClientHandler
	unregister               chan *ClientHandler

	tokens map[string]session
}

func NewHub(storage storeAdapter.StorageInterface) *Hub {
	hub := &Hub{
		storage:                  storage,
		incommingMsg:             make(chan objects.MsgObj),
		conversations:            make(map[string]map[string]bool),
		conversation_msg_counter: make(map[string]uint64),
		userBase:                 make(map[string]*ClientHandler),
		register:                 make(chan *ClientHandler),
		unregister:               make(chan *ClientHandler),
		tokens:                   make(map[string]session),
	}

	hub.initConversationsMap()

	return hub
}

func (hub *Hub) initConversationsMap() {
	pairs := hub.storage.GetAllConvIDUserIDPair()
	for _, pair := range pairs {
		if _, ok := hub.conversations[pair.ConvID]; !ok {
			hub.conversations[pair.ConvID] = make(map[string]bool)
		}

		hub.conversations[pair.ConvID][pair.RecipientID] = true
	}
}

// check if convID exists in converation map, otherwise init the and return convid
func (h *Hub) checkConvIDExist(senderID string, recipientID string) (string, bool) {
	primary := convertConvID(senderID, recipientID)
	secondary := convertConvID(recipientID, senderID)

	if _, ok := h.conversations[primary]; ok {
		return primary, true
	} else if _, ok := h.conversations[secondary]; ok {
		return secondary, true
	} else {
		h.conversations[primary] = make(map[string]bool)
		return primary, false
	}
}

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

			// check if there are users connected currently that are in this conversation
			users, ok := h.conversations[msg.ConvID]
			if ok {
				// update conversation message counter
				h.conversation_msg_counter[msg.ConvID]++
				msg.Counter = h.conversation_msg_counter[msg.ConvID]

				for user := range users {
					// if user == msg.RecipientID {
					log.Println("receipient located")

					// get the handler for this specific user
					recipientHandler, ok := h.userBase[user]
					if ok {
						recipientHandler.dispatchBuf <- msg
					}
					// }
				}
			} else {
				log.Println("WARNING: CONVERSATION ID DO NOT EXIST\n\n\n ")
			}
		}
	}
}
