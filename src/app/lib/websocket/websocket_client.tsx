import {TextData} from "../storage/text_data"
import {userID} from "../../page"

export function webSocketConnect(ws_url: string): WebSocket {
    var ws = new WebSocket(ws_url);

    ws.onopen = function() {
      // subscribe to some channels
      ws.send(JSON.stringify({
          type: "init",
          SenderId: userID
      }));
    };

    // ws.onmessage = function(e) {
    //   console.log('Message:', e.data);
    //   var msg = JSON.parse(e.data)
    //   var textObj = new TextData(msg.msgData, false, true);

    //   setTextBuffer([textObj, ...textBuffer ])
    // };

    ws.onclose = function(e) {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
        webSocketConnect(ws_url);
      }, 1000);
    };

    ws.onerror = function(err) {
      console.error('Socket encountered error: ', err, 'Closing socket');
      ws.close();
    };

    return ws
  }

// export class webSocketConnect {
//     websocket: WebSocket;

//     constructor(URL : string) {
//         let websocket = new WebSocket(URL)
//         websocket.onopen = (websocket) => {this.websocketOpen}
//         websocket.onclose = this.websocketClose
//         websocket.onerror = this.websocketError

//         this.websocket = websocket
//     }

//     private websocketOpen(socket: WebSocket) {
//       // subscribe to some channels
//       socket.send(JSON.stringify({
//           type: "init",
//           SenderId: userID
//       }));
//     };

//     private websocketClose(e : CloseEvent) {
//         let url = this.websocket.url
//         console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
//         setTimeout(function() {
//             new webSocketConnect(url)
//         }, 1000);
//     }

//     private websocketError(err : Event) {
//         console.error('Socket encountered error: ', err, 'Closing socket');
//         this.websocket.close();
//     }

//     setSocketOnMessage(f : (n:any) => void) {
//         this.websocket.onmessage = f
//     }

//     webSocketSend(msg : TextData) {
//         console.log("msg json", msg.toJson())
//         this.websocket.send(msg.toJson());
//     }
//   }
