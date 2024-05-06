package localStore

import (
	"log"
	"os"
	"path/filepath"
)

func NewLocalStoreClient() *LocalMsgStore {

	currDir, err := os.Getwd()
	if err != nil {
		log.Fatalf("Could not get current working directory: %v", err)
	}

	dbDir := os.Args[1]

	log.Print(filepath.Join(currDir, dbDir))

	// using local store implemented with sqlite
	sqlLiteStore := NewStorage(filepath.Join(currDir, dbDir))
	return sqlLiteStore
}
