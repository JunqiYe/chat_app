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

	messageStoreChan := make(chan objects.MsgObj)
	DynamoDBStore := cloudStore.NewDynamoDBClient()
	// LocalStore := localStore.NewLocalStoreClient()

	store := store.NewMessageStoreHandler(DynamoDBStore, messageStoreChan)
	go store.RunMessageStore()

	hub := apiEndpoint.NewHub(DynamoDBStore)
	go hub.HubRun()

	// store := store.NewMessageStoreHandler(DynamoDBStore)

	// start api endpoint
	endpoint := apiEndpoint.NewEndpoint(messageStoreChan, hub)
	endpoint.StartEndpoint()
}
