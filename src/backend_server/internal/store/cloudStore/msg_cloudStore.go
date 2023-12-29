package cloudStore

import (
	"backend_server/internal/objects"
	"context"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

// CloudStore encapsulates the Amazon DynamoDB service actions used in the examples.
// It contains a DynamoDB service client that is used to act on the specified table.
type CloudStore struct {
	DynamoDbClient               *dynamodb.Client
	MessageHistoryTableName      string
	ConversationMembersTableName string
}

// this struct is used to match the attributes within DynamoDB
// some information within MsgObj doesn't translate cleanly
// TODO: Update MsgObj for better separation
type CloudMsgObj struct {
	ConversationID string
	Timestamp      int64
	IsImg          bool
	MsgData        string // TODO: might change to byte in the future
	UserID         string
}

// interface calls
func (s *CloudStore) StoreMsg(msg objects.MsgObj) error {
	return s.InsertMessageHistory(msg)
}

func (s *CloudStore) StoreConvID(convID string, userID string, recipientID string) error {
	var err error
	tempConvObj1 := objects.ConverstationInfo{
		ConversationID: convID,
		SenderID:       userID,
		RecipientID:    recipientID,
		ConvName:       recipientID,
	}
	err = s.InsertConversationMember(tempConvObj1)
	if err != nil {
		return err
	}
	tempConvObj2 := objects.ConverstationInfo{
		ConversationID: convID,
		SenderID:       recipientID,
		RecipientID:    userID,
		ConvName:       userID,
	}
	err = s.InsertConversationMember(tempConvObj2)
	if err != nil {
		return err
	}
	return nil
}

func (s *CloudStore) GetHistFromConvID_V2(convID string) ([]objects.MsgObj, error) {
	msgList, err := s.GetMessageHist(convID)
	if err != nil {
		return nil, err
	}
	// copying over the from cloudMsgObj to MsgObj, might be a good idea to combine the two
	msgObjList := make([]objects.MsgObj, 0, len(msgList))
	for _, cloudMsg := range msgList {
		tempObj := objects.MsgObj{
			FrameType:   "Not Implemented",
			ConvID:      cloudMsg.ConversationID,
			Counter:     0,
			SenderID:    cloudMsg.UserID,
			RecipientID: "Not Implemented",
			MsgData:     cloudMsg.MsgData,
			Timestamp:   cloudMsg.Timestamp,
		}

		msgObjList = append(msgObjList, tempObj)
	}
	return msgObjList, nil
}

func (s *CloudStore) GetAllConvIDUserIDPair() []objects.ConverstationInfo {
	return []objects.ConverstationInfo{}
}

func (s *CloudStore) GetAllConvIDsFromUserID(userID string) ([]objects.ConverstationInfo, error) {
	return s.GetConvIDFromSenderID(userID)
}

func translateCloudMsg(msg *objects.MsgObj, cloudMsg *CloudMsgObj) {
	cloudMsg.ConversationID = msg.ConvID
	cloudMsg.Timestamp = msg.Timestamp
	cloudMsg.IsImg = false // TODO: message only for now
	cloudMsg.MsgData = msg.MsgData
	cloudMsg.UserID = msg.SenderID
}

// ListTables lists the DynamoDB table names for the current account.
func (basics *CloudStore) ListTables() ([]string, error) {
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

// given a table name and tableInput in the format of *dynamodb.CreateTableInput, create a new table
func (c *CloudStore) createDynamodbTable(tablename string, tableInput *dynamodb.CreateTableInput) (*types.TableDescription, error) {
	var tableDesc *types.TableDescription
	table, err := c.DynamoDbClient.CreateTable(context.TODO(), tableInput)
	if err != nil {
		log.Printf("Couldn't create table %v. Here's why: %v\n", tablename, err)
	} else {
		waiter := dynamodb.NewTableExistsWaiter(c.DynamoDbClient)
		err = waiter.Wait(context.TODO(), &dynamodb.DescribeTableInput{
			TableName: aws.String(tablename)}, 5*time.Minute)
		if err != nil {
			log.Printf("Wait for table exists failed. Here's why: %v\n", err)
		}
		tableDesc = table.TableDescription
	}
	return tableDesc, err
}

// ****************************************************************
//
// Table: MessageHistory
//
// ****************************************************************

// createTable(tableName)
// schema:
// ConversationID | Timestamp | UserID | IsImg | MsgData
// primaryKey	  |	sort key
func (c *CloudStore) CreateMessageHistoryTable() (*types.TableDescription, error) {
	tableInput := &dynamodb.CreateTableInput{
		AttributeDefinitions: []types.AttributeDefinition{{
			AttributeName: aws.String("ConversationID"),
			AttributeType: types.ScalarAttributeTypeS,
		}, {
			AttributeName: aws.String("Timestamp"),
			AttributeType: types.ScalarAttributeTypeN,
		}},
		KeySchema: []types.KeySchemaElement{{
			AttributeName: aws.String("ConversationID"),
			KeyType:       types.KeyTypeHash,
		}, {
			AttributeName: aws.String("Timestamp"),
			KeyType:       types.KeyTypeRange,
		}},

		TableName: aws.String(c.MessageHistoryTableName),

		ProvisionedThroughput: &types.ProvisionedThroughput{
			ReadCapacityUnits:  aws.Int64(1),
			WriteCapacityUnits: aws.Int64(1),
		},
	}

	tableDesc, err := c.createDynamodbTable(c.MessageHistoryTableName, tableInput)
	return tableDesc, err
}

// insert a new message that a user send to the MessageHistory table
// convert the MsgObj into a cloudMsgObj, and put it into the message history table
func (c CloudStore) InsertMessageHistory(msg objects.MsgObj) error {
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
func (c *CloudStore) GetMessageHist(convID string) ([]CloudMsgObj, error) {
	var err error
	var response *dynamodb.QueryOutput
	var cloudMsgs []CloudMsgObj
	keyEx := expression.Key("ConversationID").Equal(expression.Value(convID))
	expr, err := expression.NewBuilder().WithKeyCondition(keyEx).Build()
	if err != nil {
		log.Printf("Couldn't build expression for query. Here's why: %v\n", err)
	} else {
		// Note: dereference error caused by wrong import
		// https://stackoverflow.com/questions/71876200/dynamodb-scaninput-cannot-use-expr-names-type-mapstringstring-as-the
		response, err = c.DynamoDbClient.Query(context.TODO(), &dynamodb.QueryInput{
			TableName:                 aws.String(c.MessageHistoryTableName),
			ExpressionAttributeNames:  expr.Names(),
			ExpressionAttributeValues: expr.Values(),
			KeyConditionExpression:    expr.KeyCondition(),
			ScanIndexForward:          aws.Bool(false),
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

	return cloudMsgs, err
}

// deletes the message history table
func (c *CloudStore) DeleteTable(tableName string) error {

	_, err := c.DynamoDbClient.DeleteTable(context.TODO(), &dynamodb.DeleteTableInput{
		TableName: &tableName,
	})

	return err
}

// low priority
// update a message that a user perviously send to the messageHistory table, identify using messageID
// updateMessageHistory(messageID)

// low priority
// delete a message by specifying a messageID
// deleteMessageHistory(messageID) // delete a single message

// ****************************************************************
//
// Table: ConversationMembers
//
// ****************************************************************
type MemberObj struct {
	ConversationID string
	UserID         string
}

// TODO make userID also a key schema as it does not allow multiple data

func (c *CloudStore) CreateConversationMembersTable() (*types.TableDescription, error) {
	tableInput := &dynamodb.CreateTableInput{
		AttributeDefinitions: []types.AttributeDefinition{{
			AttributeName: aws.String("ConversationID"),
			AttributeType: types.ScalarAttributeTypeS,
		}, {
			AttributeName: aws.String("SenderID"),
			AttributeType: types.ScalarAttributeTypeS,
		}},
		KeySchema: []types.KeySchemaElement{{
			AttributeName: aws.String("ConversationID"),
			KeyType:       types.KeyTypeHash,
		}, {
			AttributeName: aws.String("SenderID"),
			KeyType:       types.KeyTypeRange,
		}},
		GlobalSecondaryIndexes: []types.GlobalSecondaryIndex{{
			IndexName: aws.String("SenderID"),
			KeySchema: []types.KeySchemaElement{{
				AttributeName: aws.String("SenderID"),
				KeyType:       types.KeyTypeHash,
			}},
			Projection: &types.Projection{
				// NonKeyAttributes: []string{"SenderID"},
				ProjectionType: types.ProjectionTypeAll,
			},

			ProvisionedThroughput: &types.ProvisionedThroughput{
				ReadCapacityUnits:  aws.Int64(1),
				WriteCapacityUnits: aws.Int64(1),
			},
		}},
		TableName: aws.String(c.ConversationMembersTableName),

		ProvisionedThroughput: &types.ProvisionedThroughput{
			ReadCapacityUnits:  aws.Int64(1),
			WriteCapacityUnits: aws.Int64(1),
		},
	}

	tableDesc, err := c.createDynamodbTable(c.ConversationMembersTableName, tableInput)
	return tableDesc, err
}

// get all user that are in the conversation
func (c *CloudStore) GetSenderIDFromConvID(convID string) ([]MemberObj, error) {
	var err error
	var response *dynamodb.QueryOutput
	var convMembers []MemberObj
	keyEx := expression.Key("ConversationID").Equal(expression.Value(convID))
	expr, err := expression.NewBuilder().WithKeyCondition(keyEx).Build()
	if err != nil {
		log.Printf("Couldn't build expression for query. Here's why: %v\n", err)
	} else {
		// Note: dereference error caused by wrong import
		// https://stackoverflow.com/questions/71876200/dynamodb-scaninput-cannot-use-expr-names-type-mapstringstring-as-the
		response, err = c.DynamoDbClient.Query(context.TODO(), &dynamodb.QueryInput{
			TableName:                 aws.String(c.ConversationMembersTableName),
			ExpressionAttributeNames:  expr.Names(),
			ExpressionAttributeValues: expr.Values(),
			KeyConditionExpression:    expr.KeyCondition(),
		})
		if err != nil {
			log.Printf("Couldn't query for convID  %v. Here's why: %v\n", convID, err)
		} else {
			err = attributevalue.UnmarshalListOfMaps(response.Items, &convMembers)
			if err != nil {
				log.Printf("Couldn't unmarshal query response. Here's why: %v\n", err)
			}
		}
	}

	return convMembers, err
}

// get all conversation that a user is in
// getConvID (from SenderID)
// might need to use GSI for query
// get all user that are in the conversation
func (c *CloudStore) GetConvIDFromSenderID(SenderID string) ([]objects.ConverstationInfo, error) {
	var err error
	var response *dynamodb.QueryOutput
	var convInfo []objects.ConverstationInfo
	keyEx := expression.Key("SenderID").Equal(expression.Value(SenderID))
	expr, err := expression.NewBuilder().WithKeyCondition(keyEx).Build()
	if err != nil {
		log.Printf("Couldn't build expression for query. Here's why: %v\n", err)
	} else {
		response, err = c.DynamoDbClient.Query(context.TODO(), &dynamodb.QueryInput{
			TableName:                 aws.String(c.ConversationMembersTableName),
			IndexName:                 aws.String("SenderID"),
			ExpressionAttributeNames:  expr.Names(),
			ExpressionAttributeValues: expr.Values(),
			KeyConditionExpression:    expr.KeyCondition(),
		})
		if err != nil {
			log.Printf("Couldn't query for SenderID  %v. Here's why: %v\n", SenderID, err)
		} else {
			err = attributevalue.UnmarshalListOfMaps(response.Items, &convInfo)
			if err != nil {
				log.Printf("Couldn't unmarshal query response. Here's why: %v\n", err)
			}
		}
	}

	return convInfo, err
}

// add user to conversation
// create new conversation
// insert a new message that a user send to the MessageHistory table
// convert the MsgObj into a cloudMsgObj, and put it into the message history table
func (c *CloudStore) InsertConversationMember(convInfo objects.ConverstationInfo) error {

	// using a temperarly defined struct for now
	item, err := attributevalue.MarshalMap(convInfo)
	if err != nil {
		panic(err)
	}

	_, err = c.DynamoDbClient.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String(c.ConversationMembersTableName), Item: item,
	})
	if err != nil {
		log.Printf("Couldn't add item to table. Here's why: %v\n", err)
	}
	return err
}
