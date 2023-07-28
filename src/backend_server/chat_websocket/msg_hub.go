package chat_websocket

import "log"

type Hub struct {
	storage             *msg_storage
	incommingMsg        chan msgObj
	conversations       map[string]map[string]bool // conversationID -> clientsID
	userBase            map[string]*ClientHandler
	createConversations chan msgObj
	register            chan *ClientHandler
	unregister          chan *ClientHandler
}

func NewHub(storage *msg_storage) *Hub {
	return &Hub{
		storage:             storage,
		incommingMsg:        make(chan msgObj),
		conversations:       make(map[string]map[string]bool),
		userBase:            make(map[string]*ClientHandler),
		createConversations: make(chan msgObj),
		register:            make(chan *ClientHandler),
		unregister:          make(chan *ClientHandler),
	}
}

// check if convID exists in converation map, otherwise init the and return convid
func (h *Hub) checkConvIDExist(senderID string, recipientID string) string {
	primary := convertConvID(senderID, recipientID)
	secondary := convertConvID(recipientID, senderID)

	if _, ok := h.conversations[primary]; ok {
		return primary
	} else if _, ok := h.conversations[secondary]; ok {
		return secondary
	} else {
		h.conversations[primary] = make(map[string]bool)
		return primary
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

		case msg := <-h.createConversations:

			conversationID := h.checkConvIDExist(msg.SenderID, msg.RecipientID)

			h.conversations[conversationID][msg.SenderID] = true
			h.conversations[conversationID][msg.RecipientID] = true

			msg.ConvID = conversationID
			msg.FrameType = "response convID"

			h.userBase[msg.SenderID].receive <- msg

		case msg := <-h.incommingMsg:
			if msg.FrameType == "transmit" {
				h.storage.StoreMsg(msg)
			}

			users, ok := h.conversations[msg.ConvID]

			if ok {
				for key, _ := range users {
					// if key == msg.RecipientID {
					log.Println("receipient located")
					recipientHandler, ok := h.userBase[key]
					if ok {
						recipientHandler.receive <- msg
					}
					// }
				}
			} else {
				log.Println("WARNING: CONVERSATION ID DO NOT EXIST\n\n\n ")
			}
		}
	}
}
