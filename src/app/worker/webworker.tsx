import { webSocketConnect } from "../websocket/websocket_client"
import { MessageHandler } from "../msgHandler/handler"
import { ChatStorage }  from "../storage/chat_localstorage"

// worker.postMessage(input.value);
// onmessage

const WS_URL = 'ws://localhost:8080/ws';
var storage = new ChatStorage()
var handler: MessageHandler

function createSocket() {
    console.log('createSocket')
    var socket = new WebSocket(WS_URL)
    handler = new MessageHandler(socket, storage, [], ()=>{});
}


self.onmessage = function (e) {
    const workerData = e.data;
    console.log("[WORKER] Web worker onmessage established");
    switch (workerData.connectionStatus) {
      case "init":
        createSocket();
        break;
  
      case "stop":
        handler.websocket.close();
        break;
  
      default:

    }
  }
