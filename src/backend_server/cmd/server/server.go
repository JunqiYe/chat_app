package main

import (
	"backend_server/internal/apiEndpoint"
	"backend_server/internal/objects"
	"backend_server/internal/store"
	"backend_server/internal/store/cloudStore"
	"log"
	"os"
)

const (
	SERVER_TYPE = "tcp"
	SERVER_HOST = "localhost"
	SERVER_PORT = "8080"
)

// output log to separate file
func setLogOutputFile() *os.File {
	f, err := os.OpenFile("log/testlogfile", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}
	return f
}

func main() {

	f := setLogOutputFile()
	log.SetOutput(f)
	defer f.Close()

	// channel used for sending new messages from client handlers to new message store handler
	messageStoreChan := make(chan objects.MsgObj)
	storeClient := cloudStore.NewDynamoDBClient()
	// storeClient := localStore.NewLocalStoreClient()

	store := store.NewMessageStoreHandler(storeClient, messageStoreChan)
	go store.RunMessageStore()

	// start api endpoint
	endpoint := apiEndpoint.NewEndpoint(messageStoreChan, storeClient)
	endpoint.StartEndpoint()
}
