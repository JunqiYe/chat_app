import { MessageHandler } from "../msgHandler/handler"
import { ChatStorage }  from "../storage/chat_localstorage"

// worker.postMessage(input.value);
// onmessage

const WS_URL = 'ws://localhost:8080/ws';
var storage = new ChatStorage()
var handler: MessageHandler

const userMsgInfo = {
  userID: null,
  recipientID: null
}

function createSocket() {
    console.log('createSocket')
    var socket = new WebSocket(WS_URL)
    handler = new MessageHandler(socket, storage, [], ()=>{});
}

// convID and counter generated here

self.onmessage = function (e) {
    const workerData = e.data;
    console.log("[WORKER] Web worker onmessage established", workerData.connectionStatus);
    switch (workerData.connectionStatus) {
      case "init":
        userMsgInfo.userID = workerData.userID
        createSocket();
        break;

      case "new recipient":
        userMsgInfo.recipientID = workerData.recipientID
        break

      case "outbound":
        // send over websocket
        // put in storage
        console.log("[WORKER] : new outbound msg, data: " + workerData.data.toString());

        self.postMessage({
          connectionStatus: "add msg",
          convID: "",
          counter: 0,
          data: workerData.data
        })

        break

      case "stop":
        handler.websocket.close();
        break;

      default:

    }
  }
