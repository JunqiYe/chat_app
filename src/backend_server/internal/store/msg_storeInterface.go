package store

import (
	"backend_server/internal/objects"
)

// interface for storage calls
type StorageInterface interface {
	StoreMsg(msg objects.MsgObj) error
	StoreConvID(convID string, userID string, recipientID string) error
	GetHistFromConvID_V2(convID string) ([]objects.MsgObj, error)
	GetAllConvIDsFromUserID(string) ([]objects.ConverstationInfo, error)
}
