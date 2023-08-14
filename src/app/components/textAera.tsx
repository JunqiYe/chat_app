import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TextData } from "../lib/storage/text_data";
import { prevMsgContext, mainAppContext } from "./context";
// import { worker } from "../lib/webwoker/webworker_main";
import RecipientUserTitle  from "./recipientInput";
import PrevTexts from "./prevTexts";
import InputBox from "./inputBox";
import { handler } from "../page";



export default function TextArea() {
    const ctx = useContext(mainAppContext)
    // setMsgBuffer([new TextData("", "", "", 0, ""), ...msgBuffer])
    // const msgBufferCtx = {
    //   msgBuffer: msgBuffer,
    //   setMsgBuffer: setMsgBuffer
    // }

    function addToMsgBuffer(message : MessageEvent) {
      var msg : TextData
      var data = JSON.parse(message.data)
      if (data.type === "transmit") {
        msg = new TextData(data.senderID, data.recipientID, data.convID, data.counter, data.msgData)
        var buffer = ctx.prevMsg.get(data.convID)
        if (buffer === undefined) {
          buffer = []
        }

        console.log("triggering notification")
        // new Notification("chat app", { body: data.senderID + " " + data.msgData});

        ctx.setPrevMsg(
          function(map: Map<string, TextData[]>) {
            return new Map(map.set(data.convID, [msg, ...buffer!]))
          }
        )
      }
    }

    useEffect(() =>{
      // if (handler != undefined) {
      //   handler.websocket.addEventListener("message", (message) => addToMsgBuffer(message))

      // }
    } )

    return (
      <div id="TextArea" className='grow flex flex-col min-w-fit items-center h-full justify-items-end '>
        <div className="flex items-center justify-start p-6 w-full h-[3rem] rounded-tr-lg bg-slate-500">
            {ctx.recipientID}
        </div>
        <PrevTexts />
        <InputBox  />
      </div>
    )
  }
