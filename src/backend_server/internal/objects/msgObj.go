package objects

type MsgObj struct {
	FrameType   string `json:"type"`
	ConvID      string `json:"convID"`
	Counter     uint64 `json:"counter"`
	SenderID    string `json:"senderID"`
	RecipientID string `json:"recipientID"`
	MsgData     string `json:"msgData"`
	Timestamp   int64  `json:"timestamp"`
}
