package main

import (
	"backend_server/internal/apiEndpoint"
	"backend_server/internal/store/cloudStore"
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

const (
	SERVER_TYPE = "tcp"
	SERVER_HOST = "localhost"
	SERVER_PORT = "8080"
)

func main() {
	// currDir, err := os.Getwd()
	// if err != nil {
	// 	log.Fatalf("Could not get current working directory: %v", err)
	// }

	// dbDir := os.Args[1]

	// log.Print(filepath.Join(currDir, dbDir))

	// using local store implemented with sqlite
	// sqlLiteStore := localStore.NewStorage(filepath.Join(currDir, dbDir))

	log.Println("Loading AWS config...")
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("failed to load configuration, \n%v", err)
	}

	client := dynamodb.NewFromConfig(cfg)
	DynamoDBStore := &cloudStore.CloudStore{
		DynamoDbClient:               client,
		MessageHistoryTableName:      "MessageHistory",
		ConversationMembersTableName: "ConversationMembers",
	}
	hub := apiEndpoint.NewHub(DynamoDBStore)

	go hub.HubRun()
	apiEndpoint.StartEndpoint(hub)
}
