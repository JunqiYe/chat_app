package apiEndpoint

import (
	"backend_server/internal/objects"
	"encoding/json"
	"log"
	"net/http"
)

type ConvIDResponse struct {
	UserID  string                      `json:"UserID"`
	ConvIDs []objects.ConverstationInfo `json:"ConvIDs"`
}

func marshalConvIDDataToSend(userID string, convIDs []objects.ConverstationInfo) []byte {
	// marshal data into json
	data := ConvIDResponse{
		UserID:  userID,
		ConvIDs: make([]objects.ConverstationInfo, len(convIDs)),
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
	Msgs []objects.MsgObj `json:"msgs"`
}

func marshalHistDataToSend(msgs []objects.MsgObj) []byte {
	// marshal data into json
	data := msgHistResponse{}
	data.Msgs = make([]objects.MsgObj, len(msgs))
	copy(data.Msgs, msgs)

	// convert json to []byte
	b, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
	}

	return b
}

// API request for GET conversations belonging to a user, or POST new conversations
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

		ids, err := hub.storage.GetAllConvIDsFromUserID(userID)
		if err != nil {
			log.Println("[API: ConvID] encountered error:", err.Error())
			break
		}
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

			hub.storage.StoreConvID(conversationID, senderID, recipientID)
		}

		type ConvIDResponse struct {
			ConvID string `json:"convID"`
		}
		res := ConvIDResponse{}
		res.ConvID = conversationID

		b, err := json.Marshal(res)
		if err != nil {
			log.Println(err)
		}
		w.Write(b)

		break
	default:
		w.WriteHeader(http.StatusBadRequest)

	}

}

// API request for GET message history for a conversation
func httpChatHistAPIEndpoint(hub *Hub, w http.ResponseWriter, r *http.Request) {
	log.Println("new msg hist request:", r.URL)

	switch r.Method {
	case "GET":
		q := r.URL.Query()
		convID := q.Get("convID")
		log.Println("query", convID)
		if convID != "" {
			msgs, err := hub.storage.GetHistFromConvID_V2(convID)
			if err != nil {
				log.Println(err.Error())
				break
			}
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
