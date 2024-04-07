package cloudStore

import (
	"context"
	"flag"
	"log"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func CreateStoreClient() *dynamodb.Client {
	// loading aws credentials
	log.Println("Loading AWS config...")
	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion("us-west-1"))
	if err != nil {
		log.Fatalf("failed to load configuration, \n%v", err)
	}
	client := dynamodb.NewFromConfig(cfg)

	return client
}

func NewDynamoDBClient() *CloudStore {
	var historyTableName string
	var convMemberTableName string

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

	dynamoDBStore := &CloudStore{
		DynamoDbClient:               CreateStoreClient(),
		MessageHistoryTableName:      historyTableName,
		ConversationMembersTableName: convMemberTableName,
	}

	// test connection to DynamoDB server
	tableList, err := dynamoDBStore.ListTables()
	if err != nil {
		log.Fatalf("[TEST]: error:%s", err.Error())
	}

	for _, table := range tableList {
		log.Printf("[TEST]:%s\n", table)
	}
	return dynamoDBStore
}
