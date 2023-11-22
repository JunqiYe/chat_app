package main

import (
	"backend_server/internal/api_endpoint"
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
	store := api_endpoint.NewStorage(filepath.Join(currDir, dbDir))
	hub := api_endpoint.NewHub(store)

	go hub.HubRun()
	api_endpoint.StartWebSocket(hub)
}
