package chat_websocket

var conv = make(map[string]bool)

func convertConvID(ID1 string, ID2 string) string {
	return ID1 + "-" + ID2
}
func checkConvIDExist(senderID string, recipientID string) string {

	primary := convertConvID(senderID, recipientID)
	secondary := convertConvID(recipientID, senderID)

	if _, ok := conv[primary]; ok {
		return primary
	} else if _, ok := conv[secondary]; ok {
		return secondary
	} else {
		conv[primary] = true
		return primary
	}
}
