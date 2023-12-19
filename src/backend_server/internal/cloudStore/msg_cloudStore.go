package cloudStore

import (
	"backend_server/internal/apiEndpoint"
	"context"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-sdk-go/service/dynamodb/expression"
)

// CloudStore encapsulates the Amazon DynamoDB service actions used in the examples.
// It contains a DynamoDB service client that is used to act on the specified table.
type CloudStore struct {
	DynamoDbClient          *dynamodb.Client
	MessageHistoryTableName string
}

// this struct is used to match the attributes within DynamoDB
// some information within MsgObj doesn't translate cleanly
// TODO: Update MsgObj for better separation
type CloudMsgObj struct {
	ConversationID string
	TimeStamp      uint64
	IsImg          bool
	MsgData        string // TODO: might change to byte in the future
	UserID         string
}

func translateCloudMsg(msg *apiEndpoint.MsgObj, cloudMsg *CloudMsgObj) {
	cloudMsg.ConversationID = msg.ConvID
	cloudMsg.TimeStamp = msg.TimeStamp
	cloudMsg.IsImg = false // TODO: message only for now
	cloudMsg.MsgData = msg.MsgData
	cloudMsg.UserID = msg.SenderID
}

// ListTables lists the DynamoDB table names for the current account.
func (basics CloudStore) ListTables() ([]string, error) {
	var tableNames []string
	tables, err := basics.DynamoDbClient.ListTables(
		context.TODO(), &dynamodb.ListTablesInput{})
	if err != nil {
		log.Printf("Couldn't list tables. Here's why: \n%v\n", err)
	} else {
		tableNames = tables.TableNames
	}
	return tableNames, err
}

// createTable(tableName)
// schema:
// ConversationID | Timestamp | UserID | IsImg | MsgData
// primaryKey	  |	sort key
func (c CloudStore) createMessageHistoryTable() (*types.TableDescription, error) {
	var tableDesc *types.TableDescription
	table, err := c.DynamoDbClient.CreateTable(context.TODO(), &dynamodb.CreateTableInput{
		AttributeDefinitions: []types.AttributeDefinition{{
			AttributeName: aws.String("year"),
			AttributeType: types.ScalarAttributeTypeN,
		}, {
			AttributeName: aws.String("title"),
			AttributeType: types.ScalarAttributeTypeS,
		}},
		KeySchema: []types.KeySchemaElement{{
			AttributeName: aws.String("year"),
			KeyType:       types.KeyTypeHash,
		}, {
			AttributeName: aws.String("title"),
			KeyType:       types.KeyTypeRange,
		}},

		TableName: aws.String(c.MessageHistoryTableName),

		ProvisionedThroughput: &types.ProvisionedThroughput{
			ReadCapacityUnits:  aws.Int64(1),
			WriteCapacityUnits: aws.Int64(1),
		},
	})
	if err != nil {
		log.Printf("Couldn't create table %v. Here's why: %v\n", c.MessageHistoryTableName, err)
	} else {
		waiter := dynamodb.NewTableExistsWaiter(c.DynamoDbClient)
		err = waiter.Wait(context.TODO(), &dynamodb.DescribeTableInput{
			TableName: aws.String(c.MessageHistoryTableName)}, 5*time.Minute)
		if err != nil {
			log.Printf("Wait for table exists failed. Here's why: %v\n", err)
		}
		tableDesc = table.TableDescription
	}
	return tableDesc, err
}

// insert a new message that a user send to the MessageHistory table
// convert the MsgObj into a cloudMsgObj, and put it into the message history table
func (c CloudStore) insertMessageHistory(msg apiEndpoint.MsgObj) error {
	cloudMsg := CloudMsgObj{}
	translateCloudMsg(&msg, &cloudMsg)

	item, err := attributevalue.MarshalMap(cloudMsg)
	if err != nil {
		panic(err)
	}

	_, err = c.DynamoDbClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String(c.MessageHistoryTableName), Item: item,
	})
	if err != nil {
		log.Printf("Couldn't add item to table. Here's why: %v\n", err)
	}
	return err
}

// get all message history from a conversation ID
// getMessageHist(convID)
// Query gets all movies in the DynamoDB table that were released in the specified year.
// The function uses the `expression` package to build the key condition expression
// that is used in the query.
func (c CloudStore) getMessageHist(convID string) ([]apiEndpoint.MsgObj, error) {
	var err error
	var response *dynamodb.QueryOutput
	var cloudMsgs []CloudMsgObj
	keyEx := expression.Key("ConversationID").Equal(expression.Value(convID))
	expr, err := expression.NewBuilder().WithKeyCondition(keyEx).Build()
	if err != nil {
		log.Printf("Couldn't build expression for query. Here's why: %v\n", err)
	} else {
		response, err = c.DynamoDbClient.Query(context.TODO(), &dynamodb.QueryInput{
			TableName:                 aws.String(c.MessageHistoryTableName),
			ExpressionAttributeNames:  expr.Names(), // dereference error
			ExpressionAttributeValues: expr.Values(),
			KeyConditionExpression:    expr.KeyCondition(),
		})
		if err != nil {
			log.Printf("Couldn't query for convID  %v. Here's why: %v\n", convID, err)
		} else {
			err = attributevalue.UnmarshalListOfMaps(response.Items, &cloudMsgs)
			if err != nil {
				log.Printf("Couldn't unmarshal query response. Here's why: %v\n", err)
			}
		}
	}

	// convert the messages
	var messages []apiEndpoint.MsgObj
	return messages, err
}

// deleteTable(tableName)

// Table: MessageHistory

// low priority
// update a message that a user perviously send to the messageHistory table, identify using messageID
// updateMessageHistory(messageID)

// low priority
// delete a message by specifying a messageID
// deleteMessageHistory(messageID) // delete a single message

// Table: ConvID
// get all user that are in the conversation
// getUserID (from convID)

// get all conversation that a user is in
// getConvID (from UserID)

// query
