import { webSocketConnect } from "../websocket/websocket_client";
import { ChatStorage } from "../storage/chat_localstorage";
import { TextData } from "../storage/text_data";
// import { userMsgInfo } from "../webwoker/webworker_thread";

interface serverMessage {
    type: string;
    userID: string;
    recipient: string;
    convID: string;
    data: string;
}

// handles receiving and sending messages
// put incomming and outgoing message in storage
// send and receive message through websocket
export class MessageHandler {
    currentUserID : string | null = null;
    currentRecipientID : string | null = null;
    currentConvID : string | null = null;
    websocket: WebSocket;
    storage: ChatStorage;


    constructor(websocket: WebSocket, storage: ChatStorage) {
        console.log("new connection")
        this.websocket = websocket;
        this.storage = storage;

        // this.websocket.onmessage = this.clientReceiveMessage
        this.websocket.addEventListener("message", (event) => {
            this.clientReceiveMessage(event)
        });
    }

    private sendMsg(msg: TextData) {
        console.log("msg json", msg.toJson())
        this.websocket.send(msg.toJson());
    }


    private localStoreText(data: TextData) {
        this.storage.storeText(data)
    }

    clientGetHistory(target_userID: string) {
        throw new Error("not implemented")
    }

    clientGetConvID(): Promise<string>  {
        console.log("[handler]: request convID from server")

        return new Promise<string>((resolve, reject) => {
            this.websocket.send(JSON.stringify({
                type: "request convID",
                senderID: this.currentUserID,
                recipientID: this.currentRecipientID,
            }))

            this.websocket.onmessage = (message) => {
                var data = JSON.parse(message.data)
                if (data.type === "response convID") {
                    resolve(data.convID)
                }
            }

            setTimeout(() => {
                reject("failed to get convID!");
            }, 500);

            // this.websocket.addEventListener("message", (event) => {
            //     this.clientReceiveMessage(event)
            // });
        })
    }

    clientSendMessage(data: string) {
        // if (userMsgInfo.userID == null || userMsgInfo.recipientID == null) {
        //      throw new Error("Invalid user or recipient")
        // }

        if (this.currentUserID === null ||
            this.currentRecipientID === null ||
            this.currentConvID === null) {
             throw new Error("Invalid user or recipient")
        }

        // create a new message
        // let convID = this.clientGetConvID(userMsgInfo.recipientID)
        // let count = this.storage.getConvCounter(this.currentConvID) + 1
        var msg = new TextData(this.currentUserID, this.currentRecipientID, this.currentConvID, 0, data)

        // store in storage
        // this.localStoreText(msg)

        // send thru websocket
        this.sendMsg(msg)
    }

    clientReceiveMessage(e: MessageEvent) {
        // create new TextData object
        var data = JSON.parse(e.data)
        console.log('receive message:', data);

        switch (data.type) {
            case "responseConvID":
                this.currentConvID = data.ConvID
                break
            default:
                var msg = new TextData(data.senderID, data.recipientID, data.convID, data.counter, data.msgData)

                // store in storage
                // this.localStoreText(msg)
        }
    }


}
