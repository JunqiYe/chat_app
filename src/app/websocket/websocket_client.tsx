import {TextData} from "./../storage/text_data"
import {userID} from "./../page"

export function webScoketConnect(ws_url: string, textBuffer: TextData[], setTextBuffer: (n:any) => any): WebSocket | null{
    if (userID == null) return null

    var ws = new WebSocket(ws_url);

    ws.onopen = function() {
      // subscribe to some channels
      ws.send(JSON.stringify({
          type: "init",
          SenderId: userID
      }));
    };

    ws.onmessage = function(e) {
      console.log('Message:', e.data);
      var msg = JSON.parse(e.data)
      var textObj = new TextData(msg.msgData, false, true);

      setTextBuffer([textObj, ...textBuffer ])
    };

    ws.onclose = function(e) {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
        webScoketConnect(ws_url, textBuffer, setTextBuffer);
      }, 1000);
    };

    ws.onerror = function(err) {
      console.error('Socket encountered error: ', err, 'Closing socket');
      ws.close();
    };

    return ws
  }
