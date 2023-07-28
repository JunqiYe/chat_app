package chat_websocket

import "log"

type Hub struct {
	storage                  *msg_storage
	incommingMsg             chan msgObj
	conversations            map[string]map[string]bool // conversationID -> clientsID
	conversation_msg_counter map[string]uint64          // conversation
	userBase                 map[string]*ClientHandler
	createConversations      chan msgObj
	register                 chan *ClientHandler
	unregister               chan *ClientHandler
}

func NewHub(storage *msg_storage) *Hub {
	return &Hub{
		storage:                  storage,
		incommingMsg:             make(chan msgObj),
		conversations:            make(map[string]map[string]bool),
		conversation_msg_counter: make(map[string]uint64),
		userBase:                 make(map[string]*ClientHandler),
		createConversations:      make(chan msgObj),
		register:                 make(chan *ClientHandler),
		unregister:               make(chan *ClientHandler),
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

		case msg := <-h.createConversations:
			conversationID, exists := h.checkConvIDExist(msg.SenderID, msg.RecipientID)

			if !exists {
				// init server side conversation
				h.conversations[conversationID][msg.SenderID] = true
				h.conversations[conversationID][msg.RecipientID] = true
				h.conversation_msg_counter[conversationID] = 0
			}

			// update response packet
			msg.ConvID = conversationID
			msg.FrameType = "response convID"

			// send response back to sender
			h.userBase[msg.SenderID].receive <- msg

		case msg := <-h.incommingMsg:
			if msg.FrameType == "transmit" {
				h.storage.StoreMsg(msg)
			}

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
