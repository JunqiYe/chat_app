package localStore

import (
	"backend_server/internal/objects"
	"database/sql"
	"log"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type LocalMsgStore struct {
	store  []objects.MsgObj
	msgDB  *sql.DB
	convDB *sql.DB
}

const createMsgTable string = `CREATE TABLE IF NOT EXISTS indexes(
	convID TEXT,
	counter INT,
	senderID TEXT,
	msg TEXT
);`

const createMsgTable_V2 string = `CREATE TABLE IF NOT EXISTS msgHist(
	convID TEXT,
	senderID TEXT,
	recipientID TEXT,
	timestamp INT,
	msg TEXT
);`

const createConIDTable string = `CREATE TABLE IF NOT EXISTS conversationID(
	convID TEXT,
	senderID TEXT,
	recipientID TEXT
);`

const insertConvID string = `insert into conversationID (convID, senderID, recipientID) VALUES (?,?,?);`
const getAllUserID string = `
	select distinct senderID
	from conversationID
	where convID = ?;`

const deleteFile string = `delete from indexes where fileName == ?;`

const DEFAULT_MSGDB_FILENAME string = `msg.db`

// constructor
func NewStorage(baseDir string) *LocalMsgStore {
	return &LocalMsgStore{
		store:  make([]objects.MsgObj, 0),
		msgDB:  createLocalDB(baseDir, createMsgTable_V2),
		convDB: createLocalDB(baseDir, createConIDTable),
	}
}

func (s *LocalMsgStore) NewStorage(baseDir string) {
	s.store = make([]objects.MsgObj, 0)
	s.msgDB = createLocalDB(baseDir, createMsgTable_V2)
	s.convDB = createLocalDB(baseDir, createConIDTable)
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

const insertMsg string = `
	insert into msgHist (convID, senderID, recipientID, timestamp, msg)
	VALUES (?,?,?,?,?);
	`

func updateDB(db *sql.DB, msg objects.MsgObj) error {
	statement, err := db.Prepare(insertMsg)
	if err != nil {
		log.Panic(err.Error())
	}
	_, err = statement.Exec(msg.ConvID, msg.SenderID, msg.RecipientID, msg.Timestamp, msg.MsgData)
	return err
}

func (s *LocalMsgStore) StoreMsg(msg objects.MsgObj) error {
	// s.store = append(s.store, msg)
	log.Println("ew message stored", msg.ConvID, msg.MsgData)

	return updateDB(s.msgDB, msg)
}

func (s *LocalMsgStore) StoreConvID(convID string, userID string, recipientID string) error {
	statement, err := s.convDB.Prepare(insertConvID)
	if err != nil {
		log.Panic(err.Error())
	}
	_, err = statement.Exec(convID, userID, recipientID)
	return err
}

func (s *LocalMsgStore) getAllUserFromConvID(convID string) []string {
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

func (s *LocalMsgStore) GetAllConvIDsFromUserID(userID string) []objects.ConverstationInfo {
	userIDs := make([]objects.ConverstationInfo, 0)

	rows, err := s.convDB.Query(getAllConvIDs, userID, userID, userID, userID)
	if err != nil {
		log.Panicln(err.Error())
		return userIDs
	}

	// var ids []objects.ConverstationInfo
	for rows.Next() {
		var id objects.ConverstationInfo
		rows.Scan(&id.ConvID, &id.RecipientID)

		log.Println(id)
		userIDs = append(userIDs, id)
	}

	return userIDs
}

const GetAllConvIDUserIDPair_query string = `
	SELECT DISTINCT *
	FROM (
		SELECT convID, senderID as ID·
		FROM conversationID
		UNION
		SELECT convID, recipientID as ID
		FROM conversationID);
`

func (s *LocalMsgStore) GetAllConvIDUserIDPair() []objects.ConverstationInfo {
	rows, err := s.convDB.Query(GetAllConvIDUserIDPair_query)
	if err != nil {
		log.Panicln(err.Error())
	}

	var ids []objects.ConverstationInfo = []objects.ConverstationInfo{}
	for rows.Next() {
		var id objects.ConverstationInfo
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

func (s *LocalMsgStore) getHistFromConvID(convID string) []objects.MsgObj {
	rows, err := s.convDB.Query(getHistFromConvID, convID)
	if err != nil {
		log.Panicln(err.Error())
	}

	var ids []objects.MsgObj = []objects.MsgObj{}
	for rows.Next() {
		var id objects.MsgObj
		rows.Scan(&id.ConvID, &id.Counter, &id.SenderID, &id.MsgData)
		ids = append(ids, id)
	}

	return ids
}

const GetHistFromConvID_V2 string = `
	select convID, senderID, timestamp, msg
	from msgHist
	where convID = ?
	order by timestamp desc
`

func (s *LocalMsgStore) GetHistFromConvID_V2(convID string) []objects.MsgObj {
	rows, err := s.convDB.Query(GetHistFromConvID_V2, convID)
	if err != nil {
		log.Panicln(err.Error())
	}

	var ids []objects.MsgObj = []objects.MsgObj{}
	for rows.Next() {
		var id objects.MsgObj
		rows.Scan(&id.ConvID, &id.SenderID, &id.Timestamp, &id.MsgData)
		log.Printf("[GetHistory]: %+v", id)
		ids = append(ids, id)
	}

	return ids
}
