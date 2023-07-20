package chat_websocket

import (
	"database/sql"
	"log"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type msg_storage struct {
	store []msgObj
	db    *sql.DB
}

const createTable string = `CREATE TABLE IF NOT EXISTS indexes(
	convID TEXT,
	counter INT,
	senderID TEXT,
	msg TEXT
);`
const insertMsg string = `insert into indexes (convID, counter, senderID, msg) VALUES (?,?,?,?);`
const deleteFile string = `delete from indexes where fileName == ?;`

const DEFAULT_META_FILENAME string = `msg.db`

func createLocalDB(baseDir string) *sql.DB {
	indexdbFilename := filepath.Join(baseDir, DEFAULT_META_FILENAME)
	database, err := sql.Open("sqlite3", indexdbFilename)
	if err != nil {
		log.Panic(err.Error())
	}

	// create table in .db file
	statement, err := database.Prepare(createTable)
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

func NewStorage(baseDir string) *msg_storage {
	return &msg_storage{
		store: make([]msgObj, 0),
		db:    createLocalDB(baseDir),
	}
}

func (s *msg_storage) StoreMsg(msg msgObj) {
	// s.store = append(s.store, msg)
	updateDB(s.db, msg)
}
