package main

import (
	"backend_server/internal/apiEndpoint"
	"backend_server/internal/store/cloudStore"
	"context"
	"flag"
	"log"
	"os"

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
	var historyTableName string
	var convMemberTableName string

	// output log to separate file
	f, err := os.OpenFile("log/testlogfile", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}
	defer f.Close()

	log.SetOutput(f)

	// check flag for which table to use
	testFlagPtr := flag.Bool("test", false, "using the testing table or production table")
	flag.Parse()
	if !(*testFlagPtr) {
		historyTableName = "MessageHistory"
		convMemberTableName = "ConversationMembers"
	} else {
		historyTableName = "MessageHistory_test"
		convMemberTableName = "ConversationMembers_test"

	}

	// loading aws credentials
	log.Println("Loading AWS config...")
	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion("us-west-1"))
	if err != nil {
		log.Fatalf("failed to load configuration, \n%v", err)
	}

	client := dynamodb.NewFromConfig(cfg)
	DynamoDBStore := &cloudStore.CloudStore{
		DynamoDbClient:               client,
		MessageHistoryTableName:      historyTableName,
		ConversationMembersTableName: convMemberTableName,
	}

	// tests
	tableList, err := DynamoDBStore.ListTables()
	if err != nil {
		log.Fatalf("[TEST]: error:%s", err.Error())
	}
	for _, table := range tableList {
		log.Printf("[TEST]:%s\n", table)
	}

	hub := apiEndpoint.NewHub(DynamoDBStore)

	go hub.HubRun()
	apiEndpoint.StartEndpoint(hub)
}
