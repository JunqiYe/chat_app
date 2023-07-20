package main

import (
	"backend_server/chat_websocket"
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
	// s := &websocket.Server{
	// 	Type:        SERVER_TYPE,
	// 	Host:        SERVER_HOST,
	// 	Port:        SERVER_PORT,
	// 	Initialized: false,
	// 	msgs:        make([]string, 0),
	// }

	// log.Fatal(s.ListenAndServe())
	currDir, err := os.Getwd()
	if err != nil {
		log.Fatalf("Could not get current working directory: %v", err)
	}

	dbDir := os.Args[1]

	log.Print(filepath.Join(currDir, dbDir))
	store := chat_websocket.NewStorage(filepath.Join(currDir, dbDir))
	hub := chat_websocket.NewHub(store)

	go hub.HubRun()
	chat_websocket.StartWebSocket(hub)
}
