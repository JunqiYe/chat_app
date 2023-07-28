package chat_websocket

// race condition for multiple go routine
// var conv = make(map[string]bool)

func convertConvID(ID1 string, ID2 string) string {
	return ID1 + "-" + ID2
}
