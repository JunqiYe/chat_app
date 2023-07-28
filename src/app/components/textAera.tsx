import { useContext, useEffect, useState } from "react";
import { TextData } from "../lib/storage/text_data";
import { prevMsgContext, mainAppContext } from "./context";
// import { worker } from "../lib/webwoker/webworker_main";
import RecipientUserTitle  from "./recipientInput";
import PrevTexts from "./prevTexts";
import InputBox from "./inputBox";
import { handler } from "../page";

export default function TextArea() {
    const [msgBuffer, setMsgBuffer] = useState<Map<string, TextData[]>>(new Map<string, TextData[]>());
    const ctx = useContext(mainAppContext)
    // setMsgBuffer([new TextData("", "", "", 0, ""), ...msgBuffer])
    // const msgBufferCtx = {
    //   msgBuffer: msgBuffer,
    //   setMsgBuffer: setMsgBuffer
    // }
    useEffect(() =>{
      if (handler != undefined) {


        handler.websocket.addEventListener("message", (message) => {
          var msg : TextData
          var data = JSON.parse(message.data)
          if (data.type === "transmit") {
            msg = new TextData(data.senderID, data.recipientID, data.convID, data.counter, data.msgData)
            var buffer = msgBuffer.get(data.convID)
            if (buffer === undefined) {
              buffer = []
            }
            setMsgBuffer(map => new Map(map.set(data.convID, [msg, ...buffer!])))
          }
        })
      }

      // if (handler != null) {
        
        // worker.addEventListener("message", (e: MessageEvent) =>{
        //   const workerData = e.data;
        //   switch (workerData.connectionStatus) {
        //     case "add msg":
        //       console.log("[MAIN] received message:" + workerData.data);
        //       // setMsgBuffer([workerData.data, ...msgBuffer])
        //       var msgObj = new TextData(ctx.userID, ctx.recipientID, workerData.convID, workerData.counter, workerData.data )
        //     //   setMsgBuffer([msgObj, ...msgBuffer])
        //       var buffer = msgBuffer.get(ctx.convID)
        //       setMsgBuffer(map => new Map(map.set(ctx.convID, [msgObj, ...buffer!])))
        //       break;
        //   }
        // })
      // }

    })

    return (
      <prevMsgContext.Provider value = {{prevMsg: msgBuffer, setPrevMsg:setMsgBuffer}}>
      <div id="TextArea" className='flex flex-col basis-2/3 h-[45rem] w-full max-w-md min-w-fit items-center justify-items-end rounded-2xl bg-slate-900'>
        <div className=" items-start">
            {ctx.recipientID}
        </div>
        <PrevTexts prevMsg={msgBuffer} />
        <InputBox prevMsg={msgBuffer} setPrevMsg={setMsgBuffer} />
      </div>
      </prevMsgContext.Provider>
    )
  }
