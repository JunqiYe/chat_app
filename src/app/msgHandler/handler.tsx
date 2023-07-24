import { webSocketConnect } from "../websocket/websocket_client";
import { ChatStorage } from "../storage/chat_localstorage";
import { TextData } from "../storage/text_data";
import { userID } from "../page";

// handles receiving and sending messages
// put incomming and outgoing message in storage
// send and receive message through websocket
export class MessageHandler {
    websocket: WebSocket;
    storage: ChatStorage;
    textBuffer: TextData[];
    setTextBuffer: (n: any) => any;

    constructor(websocket: WebSocket, storage: ChatStorage, textBuffer: TextData[], setTextBuffer: (n: any) => any) {
        console.log("new connection")
        this.websocket = websocket;
        this.storage = storage;
        this.textBuffer = textBuffer;
        this.setTextBuffer = setTextBuffer;

        // this.websocket.onmessage = this.clientReceiveMessage
        this.websocket.addEventListener("message", (event) => {this.clientReceiveMessage(event)});

    }

    private sendMsg(msg: TextData) {
        console.log("msg json", msg.toJson())
        this.websocket.send(msg.toJson());
    }

    private addMessageBuffer(data: TextData) {
        console.log("called")
        this.setTextBuffer([data, ...this.textBuffer]);
    }

    private localStoreText(data: TextData) {
        this.storage.storeText(data)
    }

    clientGetHistory(target_userID: string) {
        console.log("no this")
        this.setTextBuffer(this.storage.getPrevTexts(this.getCurrentConvID(target_userID), 30))
    }

    clientSendMessage(recipientID: string, data: string) {
        if (userID == null) { throw new Error("Invalid user or recipient") }
        // create a new message
        let convID = this.getCurrentConvID(recipientID)
        let count = this.storage.getConvCounter(convID) + 1
        var msg = new TextData(userID, recipientID, convID, count, data)

        // add to message buffer
        this.addMessageBuffer(msg)

        // store in storage
        this.localStoreText(msg)

        // send thru websocket
        this.sendMsg(msg)
    }

    clientReceiveMessage(e: MessageEvent) {
        // create new TextData object
        console.log('receive message:', e.data);
        var data = JSON.parse(e.data)
        var msg = new TextData(data.senderID, data.recipientID, data.convID, data.counter, data.msgData)

        // add to message buffer
        this.addMessageBuffer(msg)
        // store in storage
        this.localStoreText(msg)
    }

    // TODO change to server
    getCurrentConvID(recipientID: string) {
        let convDelimiter: string = "->"

        return userID + convDelimiter + recipientID
    }
}
