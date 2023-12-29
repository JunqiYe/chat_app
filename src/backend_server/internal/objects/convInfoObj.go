package objects

type ConverstationInfo struct {
	ConversationID string `json:"ConversationID"`
	ConvName       string `json:"ConvName"`
	SenderID       string `json:"SenderID"`
	RecipientID    string `json:"RecipientID"`
}
