// import { MessageHandler } from "../msgHandler/handler"
// import { ChatStorage }  from "../storage/chat_localstorage"

// // worker.postMessage(input.value);
// // onmessage

// export const WS_URL = 'ws://localhost:8080/ws';
// var handler: MessageHandler

// export const userMsgInfo = {
//   userID: null,
//   recipientID: null,
//   convID: null
// }

// function createSocket() {
//     console.log('createSocket')
//     var socket = new WebSocket(WS_URL)
//     var storage = new ChatStorage()
//     handler = new MessageHandler(socket, storage);
// }

// // convID and counter generated here

// self.onmessage = function (e) {
//     const workerData = e.data;
//     console.log("[WORKER] Web worker onmessage established", workerData.connectionStatus);
//     switch (workerData.connectionStatus) {
//       case "init":
//         userMsgInfo.userID = workerData.userID
//         createSocket();
//         break;

//       case "newRecipient":
//         userMsgInfo.recipientID = workerData.recipientID
//         // handler.clientGetConvID()
//         break

//       case "newOutboundMsg":
//         console.log("[WORKER] : new newOutboundMsg msg, data: " + workerData.data.toString());
//         // send over websocket
//         handler.clientSendMessage(workerData.data)
//         // put in storage

//         self.postMessage({
//           connectionStatus: "add msg",
//           convID: "",
//           counter: 0,
//           data: workerData.data
//         })

//         break

//       case "stop":
//         handler.websocket.close();
//         break;

//       default:

//     }
//   }
