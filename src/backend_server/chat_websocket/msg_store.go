package chat_websocket

import (
	"database/sql"
	"log"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type msg_storage struct {
	store  []msgObj
	msgDB  *sql.DB
	convDB *sql.DB
}

const createMsgTable string = `CREATE TABLE IF NOT EXISTS indexes(
	convID TEXT,
	counter INT,
	senderID TEXT,
	msg TEXT
);`

const createConIDTable string = `CREATE TABLE IF NOT EXISTS conversationID(
	convID TEXT,
	senderID TEXT,
	recipientID TEXT
);`

const insertMsg string = `insert into indexes (convID, counter, senderID, msg) VALUES (?,?,?,?);`
const insertConvID string = `insert into conversationID (convID, senderID, recipientID) VALUES (?,?,?);`
const getAllUserID string = `
	select distinct senderID
	from conversationID
	where convID = ?;`

const deleteFile string = `delete from indexes where fileName == ?;`

const DEFAULT_MSGDB_FILENAME string = `msg.db`

// constructor
func NewStorage(baseDir string) *msg_storage {
	return &msg_storage{
		store:  make([]msgObj, 0),
		msgDB:  createLocalDB(baseDir, createMsgTable),
		convDB: createLocalDB(baseDir, createConIDTable),
	}
}

func createLocalDB(baseDir string, query string) *sql.DB {
	indexdbFilename := filepath.Join(baseDir, DEFAULT_MSGDB_FILENAME)
	database, err := sql.Open("sqlite3", indexdbFilename)
	if err != nil {
		log.Panic(err.Error())
	}

	// create table in .db file
	statement, err := database.Prepare(query)
	if err != nil {
		log.Panic(err.Error())
	}
	statement.Exec()

	return database
}

func updateDB(db *sql.DB, msg msgObj) {
	statement, err := db.Prepare(insertMsg)
	if err != nil {
		log.Panic(err.Error())
	}
	statement.Exec(msg.ConvID, msg.Counter, msg.SenderID, msg.MsgData)
}

func (s *msg_storage) StoreMsg(msg msgObj) {
	// s.store = append(s.store, msg)
	log.Println("ew message stored", msg.ConvID, msg.MsgData)

	updateDB(s.msgDB, msg)
}

func (s *msg_storage) storeConvID(convID string, userID string, recipientID string) {
	statement, err := s.convDB.Prepare(insertConvID)
	if err != nil {
		log.Panic(err.Error())
	}
	statement.Exec(convID, userID, recipientID)
}

func (s *msg_storage) getAllUserFromConvID(convID string) []string {
	rows, err := s.convDB.Query(getAllUserID, convID)
	if err != nil {
		log.Panic(err.Error())
	}

	userIDs := make([]string, 0)
	var id string = ""
	for rows.Next() {
		rows.Scan(&id)
		userIDs = append(userIDs, id)
	}

	return userIDs
}

const getAllConvIDs string = `
	select convID, CASE
		when senderID != ? then senderID
		when recipientID != ? then recipientID
		END as id
	from conversationID
	where senderID = ? or recipientID = ?;
`

func (s *msg_storage) getAllConvIDsFromUserID(userID string) []converstationInfo {
	userIDs := make([]converstationInfo, 0)

	rows, err := s.convDB.Query(getAllConvIDs, userID, userID, userID, userID)
	if err != nil {
		log.Panicln(err.Error())
		return userIDs
	}

	// var ids []converstationInfo
	for rows.Next() {
		var id converstationInfo
		rows.Scan(&id.ConvID, &id.RecipientID)

		log.Println(id)
		userIDs = append(userIDs, id)
	}

	return userIDs
}

const getAllConvIDUserIDPair string = `
	SELECT DISTINCT *
	FROM (
		SELECT convID, senderID as ID·
		FROM conversationID
		UNION
		SELECT convID, recipientID as ID
		FROM conversationID);
`

func (s *msg_storage) getAllConvIDUserIDPair() []converstationInfo {
	rows, err := s.convDB.Query(getAllConvIDUserIDPair)
	if err != nil {
		log.Panicln(err.Error())
	}

	var ids []converstationInfo = []converstationInfo{}
	for rows.Next() {
		var id converstationInfo
		rows.Scan(&id.ConvID, &id.RecipientID)
		ids = append(ids, id)
	}

	return ids
}

const getHistFromConvID string = `
	select convID, counter, senderID, msg
	from indexes
	where convID = ?
	order by counter desc
`

func (s *msg_storage) getHistFromConvID(convID string) []msgObj {
	rows, err := s.convDB.Query(getHistFromConvID, convID)
	if err != nil {
		log.Panicln(err.Error())
	}

	var ids []msgObj = []msgObj{}
	for rows.Next() {
		var id msgObj
		rows.Scan(&id.ConvID, &id.Counter, &id.SenderID, &id.MsgData)
		ids = append(ids, id)
	}

	return ids
}
