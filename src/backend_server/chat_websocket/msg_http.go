package chat_websocket

import (
	"encoding/json"
	"log"
	"net/http"
)

type converstationInfo struct {
	ConvID      string `json:"ConvID"`
	RecipientID string `json:"RecipientID"`
}

type convIDResponse struct {
	UserID  string              `json:"UserID"`
	ConvIDs []converstationInfo `json:"ConvIDs"`
}

func marshalConvIDDataToSend(userID string, convIDs []converstationInfo) []byte {
	// marshal data into json
	data := convIDResponse{
		UserID:  userID,
		ConvIDs: make([]converstationInfo, len(convIDs)),
	}
	copy(data.ConvIDs, convIDs)

	// convert json to []byte
	b, err := json.Marshal(data)
	log.Println(b)
	if err != nil {
		log.Println(err)
	}

	return b
}

type msgHistResponse struct {
	Msgs []msgObj `json:"msgs"`
}

func marshalHistDataToSend(msgs []msgObj) []byte {
	// marshal data into json
	data := msgHistResponse{}
	data.Msgs = make([]msgObj, len(msgs))
	copy(data.Msgs, msgs)

	// convert json to []byte
	b, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
	}

	return b
}

func httpConvIDAPIEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
	log.Println("new convid request:", r.URL)
	q := r.URL.Query()
	w.Header().Add("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")

	switch r.Method {
	case "GET":
		userID := q.Get("userID")
		log.Println("query", userID)
		if userID == "" {
			w.WriteHeader(http.StatusBadRequest)
			break
		}

		ids := hub.storage.getAllConvIDsFromUserID(userID)
		log.Println("ids :", ids)
		w.Write(marshalConvIDDataToSend(userID, ids))
		break

	case "POST":
		senderID := q.Get("senderID")
		recipientID := q.Get("recipientID")

		if senderID == "" || recipientID == "" {
			w.WriteHeader(http.StatusBadRequest)
			break
		}

		conversationID, exists := hub.checkConvIDExist(senderID, recipientID)

		if !exists {
			log.Println("new conversation created", conversationID)
			// init server side conversation
			hub.conversations[conversationID][senderID] = true
			hub.conversations[conversationID][recipientID] = true
			hub.conversation_msg_counter[conversationID] = 0

			hub.storage.storeConvID(conversationID, senderID, recipientID)
		}

		type temp struct {
			ConvID string `json:"convID"`
		}
		temp2 := temp{}
		temp2.ConvID = conversationID
		log.Println(temp2)
		b, err := json.Marshal(temp2)
		if err != nil {
			log.Println(err)
		}
		w.Write(b)

		// w.Header().Add()
		// w.WriteHeader(http.StatusCreated)

		break
	default:
		w.WriteHeader(http.StatusBadRequest)

	}

}

func httpChatHistAPIEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
	log.Println("new msg hist request:", r.URL)

	switch r.Method {
	case "GET":
		q := r.URL.Query()
		convID := q.Get("convID")
		log.Println("query", convID)
		if convID != "" {
			msgs := hub.storage.getHistFromConvID(convID)
			log.Println(msgs)

			w.Header().Add("Content-Type", "application/json")
			w.Header().Add("Access-Control-Allow-Origin", "*")
			w.Write(marshalHistDataToSend(msgs))
		}
		break
	default:
		w.WriteHeader(http.StatusBadRequest)

	}

}
