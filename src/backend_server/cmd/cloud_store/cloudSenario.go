package main

import (
	"backend_server/internal/cloudStore"
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func main() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("failed to load configuration, \n%v", err)
	}

	client := dynamodb.NewFromConfig(cfg)

	tb := cloudStore.CloudStore{DynamoDbClient: client, MessageHistoryTableName: "MessageHistory"}

	tables, err := tb.ListTables()
	if err != nil {
		log.Fatalln("something went wrong")
	}
	fmt.Println(tables)

	// msg := apiEndpoint.MsgObj{
	// 	FrameType:   "0",
	// 	ConvID:      "0",
	// 	Counter:     0,
	// 	SenderID:    "1",
	// 	RecipientID: "2",
	// 	MsgData:     "msg",
	// 	TimeStamp:   0,
	// }
	// item, err := attributevalue.MarshalMap(msg)
	// if err != nil {
	// 	panic(err)
	// }
	// for k, v := range item {
	// 	fmt.Println(k, v)
	// }

	// // getting all message from a conversation ID
	// messages, err := tb.GetMessageHist("conv1")
	// if err != nil {
	// 	log.Fatalf("something went wrong: \n%v", err.Error())
	// }
	// for m := range messages {
	// 	fmt.Printf("%v", m)
	// }
}
