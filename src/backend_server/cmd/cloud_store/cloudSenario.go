package main

import (
	"backend_server/internal/apiEndpoint"
	"backend_server/internal/cloudStore"
	"bufio"
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func StringPrompt(label string) string {
	var s string
	r := bufio.NewReader(os.Stdin)
	for {
		fmt.Fprint(os.Stdout, label+" ")
		s, _ = r.ReadString('\n')
		if s != "" {
			break
		}
	}
	return strings.TrimSpace(s)
}

type senarioInfo struct {
	userID       string
	convID       string
	receipientID string
}

func main() {
	fmt.Println("Loading AWS config...")
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("failed to load configuration, \n%v", err)
	}

	client := dynamodb.NewFromConfig(cfg)
	store := cloudStore.CloudStore{DynamoDbClient: client, MessageHistoryTableName: "MessageHistory"}

	testSenario := senarioInfo{
		userID:       "user1",
		convID:       "conv1",
		receipientID: "user2",
	}

	fmt.Printf("default information: %+v\n", testSenario)
mainLoop:
	for {
		opt := StringPrompt("working with MessageHistory Table.\n" +
			"\tu: update user and conversation information\n" +
			"\tc: create a MessageHistory table\n" +
			"\tr: read/query MessageHistory\n" +
			"\tw: write to MessageHistory\n" +
			"\td: delete the Table\n" +
			"\tq: quit\n")
		switch opt {
		case "u":
			fmt.Printf("current converstation configuration: %+v\n", testSenario)
			userID := StringPrompt("update userID? (n for no update)")
			if userID != "n" {
				testSenario.userID = userID
			}
			// resID := StringPrompt("update conversationID? (n for no update)")
			// if resID != "n" {
			//     testSenario.receipientID = resID
			// }
			convID := StringPrompt("update conversationID? (n for no update)")
			if convID != "n" {
				testSenario.convID = convID
			}

			fmt.Printf("current converstation configuration: %+v\n", testSenario)
			break
		case "c":
			fmt.Printf("creating MessageHistory table\n")

			_, err = store.CreateMessageHistoryTable()
			if err != nil {
				fmt.Printf("Encouter error: %v\n", err.Error())
			}
			break
		case "r":
			fmt.Printf("Calling DynamoDB query on conversationID: %s\n", testSenario.convID)
			msgs, err := store.GetMessageHist(testSenario.convID)
			if err != nil {
				fmt.Printf("Encouter error: %v\n", err.Error())
			}

			fmt.Printf("---------------------\nHistory:\n")
			for i, msg := range msgs {
				fmt.Printf("%d, %+v\n", i, msg)
			}
			fmt.Printf("---------------------\n")
			break
		case "w":
			textMsg := StringPrompt("what message to send?")
			fmt.Printf("Sending to conversationID: %s as %s\n", testSenario.convID, testSenario.userID)
			err = store.InsertMessageHistory(apiEndpoint.MsgObj{
				FrameType:   "stub",
				ConvID:      testSenario.convID,
				Counter:     0,
				SenderID:    testSenario.userID,
				RecipientID: "stub",
				MsgData:     textMsg,
				Timestamp:   time.Now().Unix(),
			})

			if err != nil {
				fmt.Printf("Encouter error: %v\n", err.Error())
			}

			fmt.Printf("message added\n")
			break
		case "d":
			fmt.Printf("deleting %s\n", store.MessageHistoryTableName)
			err = store.DeleteTable()
			if err != nil {
				fmt.Printf("Encouter error: %v\n", err.Error())
			}
			fmt.Printf("table deleted\n")

			break
		case "q":
			fmt.Printf("Quitting application...\n")
			break mainLoop

		default:
			fmt.Fprintf(os.Stdout, "Wrong input\n")
			break
		}

		fmt.Printf("\n")
	}
	// tables, err := tb.ListTables()
	// if err != nil {
	// 	log.Fatalln("something went wrong")
	// }
	// fmt.Println(tables)

	// msg := apiEndpoint.MsgObj{
	// 	FrameType:   "0",
	// 	ConvID:      "0",
	// 	Counter:     0,
	// 	SenderID:    "1",
	// 	RecipientID: "2",
	// 	MsgData:     "msg",
	// 	Timestamp:   0,
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
