package storeAdapter

import (
	"backend_server/internal/objects"
)

// adapter for connecting low-level api calls to the storage and the main server
type StorageInterface interface {
	StoreMsg(msg objects.MsgObj) error
	StoreConvID(convID string, userID string, recipientID string) error
	GetHistFromConvID_V2(convID string) []objects.MsgObj
	GetAllConvIDUserIDPair() []objects.ConverstationInfo
	GetAllConvIDsFromUserID(string) []objects.ConverstationInfo
}

func StoreMsg_adapter(store StorageInterface, msg objects.MsgObj) error {
	return store.StoreMsg(msg)
}

func StoreConvID_adapter(store StorageInterface, convID string, userID string, recipientID string) error {
	return store.StoreConvID(convID, userID, recipientID)
}

func GetHistFromConvID_V2_adapter(store StorageInterface, convID string) []objects.MsgObj {
	return store.GetHistFromConvID_V2(convID)
}

func GetAllConvIDUserIDPair_adapter(store StorageInterface) []objects.ConverstationInfo {
	return store.GetAllConvIDUserIDPair()
}
