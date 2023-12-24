package main

import (
	"backend_server/internal/apiEndpoint"
	"backend_server/internal/store/localStore"
	"log"
	"os"
	"path/filepath"
)

const (
	SERVER_TYPE = "tcp"
	SERVER_HOST = "localhost"
	SERVER_PORT = "8080"
)

func main() {
	currDir, err := os.Getwd()
	if err != nil {
		log.Fatalf("Could not get current working directory: %v", err)
	}

	dbDir := os.Args[1]

	log.Print(filepath.Join(currDir, dbDir))
	// store := localStore.LocalMsgStore{}
	// store.NewStorage(filepath.Join(currDir, dbDir))
	store := localStore.NewStorage(filepath.Join(currDir, dbDir))
	hub := apiEndpoint.NewHub(store)

	go hub.HubRun()
	apiEndpoint.StartWebSocket(hub)
}
