package main

import (
	"database/sql"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

const createTable string = `CREATE TABLE IF NOT EXISTS indexes(
	fileName TEXT,
  	version INT,
  	hashIndex INT,
  	hashValue TEXT
);`

type Server struct {
	Type        string // "tcp"
	Host        string // "localhost"
	Port        string // "8080"
	SrcID       string
	Initialized bool
	Msgs        []string //
}

type msg struct {
	userID   string
	targetID string
	size     int
	rawData  []byte
}

const insertHash string = `insert into indexes (fileName, version, hashIndex, hashValue) VALUES (?,?,?,?);`
const deleteFile string = `delete from indexes where fileName == ?;`
const DEFAULT_META_FILENAME string = `something.db`

func createLocalDB(baseDir string) *sql.DB {
	indexdbFilename := filepath.Join(".", baseDir, DEFAULT_META_FILENAME)
	database, err := sql.Open("sqlite3", indexdbFilename)
	if err != nil {
		fmt.Println(err.Error())
	}

	// create table in .db file
	statement, err := database.Prepare(createTable)
	if err != nil {
		fmt.Println(err.Error())
	}
	statement.Exec()

	return database
}

func (s *Server) initConnectionStatus(incommingData chan []byte) error {
	// client should send user information before data exchange happens
	// close connection if information is failed
	// temp := make([]byte, 100)
	// data, err := conn.Read(temp)

	// if err != nil {
	// 	return fmt.Errorf("connection failed")
	// }
	return errors.New("connection failed")
}

func (s *Server) processData(buffer []byte) {
	if len(buffer) < 8 {
		return
	}

	msgSize := binary.BigEndian.Uint64(buffer[:8])
	msg := ""

	print(string(buffer))
	print(msgSize)
	if uint64(len(buffer[8:])) < msgSize {
		return
	} else {
		msg = string(buffer[8:msgSize])
		buffer = buffer[8+msgSize:]
	}

	if !s.Initialized {
		s.SrcID = msg
		s.Initialized = true
	} else {
		s.Msgs = append(s.Msgs, msg)
		fmt.Println(s.Msgs)
	}
}

func (s *Server) handleConnection(conn net.Conn) {
	defer conn.Close()

	fmt.Println("handling connection, ", conn.RemoteAddr())

	// incommingData := make(chan []byte)

	// err := s.initConnectionStatus(conn, incommingData)
	// if err != nil {
	// 	log.Println("failed to initialize connection")
	// 	return
	// }
	// verified := false
	buffer := make([]byte, 4096)
	remaining := []byte{}
	for {
		s.processData(remaining)

		size, err := conn.Read(buffer)
		if err != nil {
			fmt.Println("error reading from connection: ", err.Error())
			if err == io.EOF {
				log.Printf("connection closed")
				return
			}
		}

		remaining = append(remaining, buffer[:size]...)
	}

}

func (s *Server) ListenAndServe() error {
	fmt.Println("listening on host:port", s.Host+":"+s.Port)
	listener, err := net.Listen(s.Type, s.Host+":"+s.Port)
	if err != nil {
		log.Println(err)
		return err
	}

	defer listener.Close()

	// db := createLocalDB(client.BaseDir)

	for {
		conn, err := listener.Accept()

		if err != nil {
			log.Println(err)
		}

		go s.handleConnection(conn)
	}
}
