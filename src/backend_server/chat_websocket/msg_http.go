package chat_websocket

import (
	"encoding/json"
	"log"
)

type convIDResponse struct {
	UserID  string
	ConvIDs []string
}

func marshalDataToSend(userID string, convIDs []string) []byte {
	// get convIDs from storage

	// marshal data into json
	// place holder value
	// convIDs := []string{"convid1", "convid2"}
	data := convIDResponse{UserID: userID, ConvIDs: convIDs}

	// convert json to []byte
	b, err := json.Marshal(data)
	if err != nil {
		log.Println(err)
	}

	return b
}
