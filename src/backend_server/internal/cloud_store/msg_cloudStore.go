package cloud_store

import (
	"backend_server/internal/api_endpoint"
	"context"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

// cloudStore encapsulates the Amazon DynamoDB service actions used in the examples.
// It contains a DynamoDB service client that is used to act on the specified table.
type cloudStore struct {
	DynamoDbClient          *dynamodb.Client
	MessageHistoryTableName string
}

// createTable(tableName)
// schema:
// ConversationID | Timestamp | UserID | IsImg | MsgData
// primaryKey	  |	sort key
func (c cloudStore) createMessageHistoryTable() (*types.TableDescription, error) {
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

func (c cloudStore) AddMovie(msg api_endpoint.MsgObj) error {
	item, err := attributevalue.MarshalMap(msg)
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

// deleteTable(tableName)

// Table: MessageHistory

// insert a new message that a user send to the MessageHistory table
// insertMessageHistory(new msg)

// low priority
// update a message that a user perviously send to the messageHistory table, identify using messageID
// updateMessageHistory(messageID)

// low priority
// delete a message by specifying a messageID
// deleteMessageHistory(messageID) // delete a single message

// get all message history from a conversation ID
// getMessageHist(convID)

// Table: ConvID
// get all user that are in the conversation
// getUserID (from convID)

// get all conversation that a user is in
// getConvID (from UserID)

// query
