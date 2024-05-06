package store

import (
	"backend_server/internal/objects"
)

type MessageStore struct {
	storage     StorageInterface
	messageChan chan objects.MsgObj
}

func NewMessageStoreHandler(storage StorageInterface, msgChan chan objects.MsgObj) *MessageStore {
	return &MessageStore{
		storage:     storage,
		messageChan: msgChan,
	}
}

func (s *MessageStore) RunMessageStore() {
	// messageChan := make(chan objects.MsgObj)
	for {
		newMsg := <-s.messageChan
		if newMsg.FrameType == "transmit" {
			s.storage.StoreMsg(newMsg)
		}
	}
}
