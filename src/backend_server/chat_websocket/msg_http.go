package chat_websocket

import (
	"encoding/json"
	"log"
)

type converstationInfo struct {
	ConvID      string `json:"ConvID"`
	RecipientID string `json:"RecipientID"`
}

type convIDResponse struct {
	UserID  string              `json:"UserID"`
	ConvIDs []converstationInfo `json:"ConvIDs"`
}

func marshalDataToSend(userID string, convIDs []converstationInfo) []byte {
	// marshal data into json
	data := convIDResponse{UserID: userID}
	for _, obj := range convIDs {
		data.ConvIDs = append(data.ConvIDs, obj)
	}

	// convert json to []byte
	b, err := json.Marshal(data)
	log.Println(b)
	if err != nil {
		log.Println(err)
	}

	return b
}
