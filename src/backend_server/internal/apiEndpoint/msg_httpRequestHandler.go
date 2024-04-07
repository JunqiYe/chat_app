package apiEndpoint

import (
	"backend_server/internal/objects"
	"encoding/json"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/juliangruber/go-intersect"
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
		// check if a conversation exists between the sender and the recipient
		// by finding the intersection of the sender and the recipient conversation ids
		senderConvs, err := hub.storage.GetAllConvIDsFromUserID(senderID)
		if err != nil {
			log.Println("[API CONVID] encountered error:", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			break
		}
		recipientConv, err := hub.storage.GetAllConvIDsFromUserID(recipientID)
		if err != nil {
			log.Println("[API CONVID] encountered error:", err.Error())
			w.WriteHeader(http.StatusBadRequest)
			break
		}

		senderConvIDs := []string{}
		for _, convID := range senderConvs {
			senderConvIDs = append(senderConvIDs, convID.ConversationID)
		}

		recipientConvIDs := []string{}
		for _, convID := range recipientConv {
			recipientConvIDs = append(recipientConvIDs, convID.ConversationID)
		}

		intersection := intersect.Hash(senderConvIDs, recipientConvIDs)

		type ConvIDResponse struct {
			ConvID string `json:"convID"`
		}

		res := ConvIDResponse{}
		// if conversation already exists, reply with the conversation ID
		if len(intersection) != 0 {
			res.ConvID = intersection[0].(string)

		} else {
			// conversation does not exist, create a convID and add to storage, reply with the conversation
			newConvID := uuid.NewString()
			res.ConvID = newConvID
			err = hub.storage.StoreConvID(newConvID, senderID, recipientID)
			if err != nil {
				log.Println("[API CONVID] encountered error:", err.Error())
				w.WriteHeader(http.StatusBadRequest)
				break
			}
		}

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
			// log.Println("[CHATHIST API]", msgs)

			w.Header().Add("Content-Type", "application/json")
			w.Header().Add("Access-Control-Allow-Origin", "*")
			w.Write(marshalHistDataToSend(msgs))
		}
		break
	default:
		w.WriteHeader(http.StatusBadRequest)

	}

}
