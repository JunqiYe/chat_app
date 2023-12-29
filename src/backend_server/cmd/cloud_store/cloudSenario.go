package main

import (
	"backend_server/internal/objects"
	"backend_server/internal/store/cloudStore"
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

const (
	historyTable int = 0
	memberTable      = 1
)

type senarioInfo struct {
	whichTable   int
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
	store := cloudStore.CloudStore{
		DynamoDbClient:               client,
		MessageHistoryTableName:      "MessageHistory",
		ConversationMembersTableName: "ConversationMembers",
	}

	testSenario := senarioInfo{
		userID:       "user1",
		convID:       "conv1",
		receipientID: "user2",
		whichTable:   historyTable,
	}

	fmt.Printf("default information: %+v\n", testSenario)

mainLoop:
	for {
		if testSenario.whichTable == historyTable {

			opt := StringPrompt("working with MessageHistory Table.\n" +
				"\tu: update user and conversation information\n" +
				"\tc: create a MessageHistory table\n" +
				"\tr: read/query MessageHistory\n" +
				"\tw: write to MessageHistory\n" +
				"\td: delete the Table\n" +
				"\ts: switch the table currently working on\n" +
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
				err = store.InsertMessageHistory(objects.MsgObj{
					FrameType:   "stub",
					ConvID:      testSenario.convID,
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
				err = store.DeleteTable(store.MessageHistoryTableName)
				if err != nil {
					fmt.Printf("Encouter error: %v\n", err.Error())
				}
				fmt.Printf("table deleted\n")

				break
			case "s":
				fmt.Printf("switching table...\n")
				testSenario.whichTable = memberTable
				break

			case "q":
				fmt.Printf("Quitting application...\n")
				break mainLoop

			default:
				fmt.Fprintf(os.Stdout, "Wrong input\n")
				break
			}
		} else if testSenario.whichTable == memberTable {
			opt := StringPrompt("working with ConversationMembers Table.\n" +
				"\tu: update user and conversation information\n" +
				"\tc: create ConversationMembers table\n" +
				"\trc: read/query ConversationMembers\n" +
				"\tru: read/query ConversationMembers\n" +
				"\tw: write to ConversationMembers\n" +
				"\td: delete the Table\n" +
				"\ts: switch the table currently working on\n" +
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
				fmt.Printf("creating ConversationMembers table\n")

				_, err = store.CreateConversationMembersTable()
				if err != nil {
					fmt.Printf("Encouter error: %v\n", err.Error())
				}
				break
			case "rc":
				// fmt.Printf("Calling DynamoDB query on conversationID: %s\n", testSenario.convID)
				convID := StringPrompt("which conversationID?")
				members, err := store.GetSenderIDFromConvID(convID)
				if err != nil {
					fmt.Printf("Encouter error: %v\n", err.Error())
				}

				for i, m := range members {
					fmt.Printf("%d, %+v\n", i, m)
				}
				break
			case "ru":
				// fmt.Printf("Calling DynamoDB query on conversationID: %s\n", testSenario.convID)
				userID := StringPrompt("which userID?")
				members, err := store.GetConvIDFromSenderID(userID)
				if err != nil {
					fmt.Printf("Encouter error: %v\n", err.Error())
				}

				for i, m := range members {
					fmt.Printf("%d, %+v\n", i, m)
				}
				break
			case "w":
				convID := StringPrompt("which conversationID?")
				userID := StringPrompt("which userID?")
				recipientID := StringPrompt("which recipient?")

				err = store.StoreConvID(convID, userID, recipientID)
				if err != nil {
					fmt.Printf("Encouter error: %v\n", err.Error())
				}

				fmt.Printf("member added\n")
				break
			case "d":
				fmt.Printf("deleting %s\n", store.ConversationMembersTableName)
				err = store.DeleteTable(store.ConversationMembersTableName)
				if err != nil {
					fmt.Printf("Encouter error: %v\n", err.Error())
				}
				fmt.Printf("table deleted\n")

				break
			case "s":
				fmt.Printf("switching table...\n")
				testSenario.whichTable = historyTable
				break
			case "q":
				fmt.Printf("Quitting application...\n")
				break mainLoop

			default:
				fmt.Fprintf(os.Stdout, "Wrong input\n")
				break
			}

		}

		fmt.Printf("\n")
	}
	// tables, err := tb.ListTables()
	// if err != nil {
	// 	log.Fatalln("something went wrong")
	// }
	// fmt.Println(tables)

	// msg := objects.MsgObj{
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
