import { ChatStorage } from "../storage/chat_localstorage";
import { TextData } from "../storage/text_data";

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
    currentUserID : string | null = null; // single source of truth?
    currentRecipientID : string | null = null;
    currentConvID : string | null = null;
    websocket: WebSocket;
    storage: ChatStorage;
    controller = new AbortController();

    // send userID information to server when connecting
    private initConnection() {
        if (this.currentUserID == null) throw new Error("userID not specified when connecting to server");

        // send init message to server thru websocket
        var id = this.currentUserID
        this.websocket.addEventListener("open", function() {
            this.send(JSON.stringify({
                type: "init",
                SenderId: id
            }))
        })
    }


    private sendMsg(msg: TextData) {
        console.log("msg json", msg.toJson())
        this.websocket.send(msg.toJson());
    }


    private localStoreText(data: TextData) {
        this.storage.storeText(data)
    }

    constructor(userID: string, websocket: WebSocket, storage: ChatStorage) {
        console.log("[Handler]: new connection")
        this.websocket = websocket;
        this.storage = storage;
        this.currentUserID = userID;
        this.initConnection()

        // init the onmessage handler
        // page needs to reinit with new callback function
        this.websocket.onmessage = (e: MessageEvent) => { this.clientReceiveMessage(e, ()=>{})}
        // this.websocket.addEventListener(
        //     "message",
        //     (event) => {
        //         this.clientReceiveMessage(event, this.someMsgFunction)
        //     },
        //     {signal: this.controller.signal});
    }


    clientGetHistory(target_userID: string) {
        throw new Error("not implemented")
    }

    // happens whenever user types in a recipients
    // if no conversation, creates a new conversation
    clientGetConvID(): Promise<string>  {
        console.log("[handler]: request convID from server")

        return new Promise<string>((resolve, reject) => {
            this.websocket.send(JSON.stringify({
                type: "request convID",
                senderID: this.currentUserID,
                recipientID: this.currentRecipientID,
            }))

            this.websocket.addEventListener("message", (message) => {
                var data = JSON.parse(message.data)
                if (data.type === "response convID") {
                    resolve(data.convID)
                }
            })

            setTimeout(() => {
                reject("failed to get convID!");
            }, 500);
        })
    }

    // whenever user press enter on input box
    clientSendMessage(data: string) {
        if (this.currentUserID === null ||
            this.currentRecipientID === null ||
            this.currentConvID === null) {
             throw new Error("Invalid user or recipient")
        }

        // create a new message
        var msg = new TextData(this.currentUserID, this.currentRecipientID, this.currentConvID, 0, data)

        // store in storage
        // this.localStoreText(msg)

        // send thru websocket
        this.sendMsg(msg)
    }

    // client received message from server, can be any conversation and sender
    // should add message to corresponding conversation
    // clientReceiveMessage(e: MessageEvent, callback: (n:any, n1:any, n2:any)=>void, buffer: Map<string, TextData[]>, setBuffer: (n:any)=>void) {
    clientReceiveMessage(e: MessageEvent, msgCallback: (n:any)=>void ) {
        // create new TextData object
        var data = JSON.parse(e.data)
        console.log('[HANDLER]: receive message:', data);

        switch (data.type) {
            case "transmit":
                var msg = new TextData(data.senderID, data.recipientID, data.convID, data.counter, data.msgData)
                msgCallback(msg);

            default:

                // store in storage
                // this.localStoreText(msg)
        }
    }


}
