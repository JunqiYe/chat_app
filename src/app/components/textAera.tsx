import { useContext, useEffect, useState } from "react";
import { TextData } from "../lib/storage/text_data";
import { prevMsgContext, mainAppContext } from "./context";
import { worker } from "../lib/webwoker/webworker_main";
import RecipientUserTitle  from "./recipientInput";
import PrevTexts from "./prevTexts";
import InputBox from "./inputBox";

export default function TextArea() {
    const [msgBuffer, setMsgBuffer] = useState<TextData[]>([])
    const ctx = useContext(mainAppContext)
    // setMsgBuffer([new TextData("", "", "", 0, ""), ...msgBuffer])
    // const msgBufferCtx = {
    //   msgBuffer: msgBuffer,
    //   setMsgBuffer: setMsgBuffer
    // }
    useEffect(() =>{
      if (worker != null) {
        worker.addEventListener("message", (e: MessageEvent) =>{
          const workerData = e.data;
          switch (workerData.connectionStatus) {
            case "add msg":
              console.log("[MAIN] received message:" + workerData.data);
              // setMsgBuffer([workerData.data, ...msgBuffer])
              var msgObj = new TextData(ctx.userID, ctx.recipientID, workerData.convID, workerData.counter, workerData.data )
              setMsgBuffer([msgObj, ...msgBuffer])
              break;
          }
        })
      }

    })

    return (
      <prevMsgContext.Provider value = {{prevMsg: msgBuffer, setPrevMsg:setMsgBuffer}}>
      <div id="TextArea" className='flex flex-col basis-2/3 h-[45rem] w-full max-w-md min-w-fit items-center justify-items-end rounded-2xl bg-slate-900'>
        <div className=" items-start">
            {ctx.convID.split('-')[1]}
        </div>
        <PrevTexts prevMsg={msgBuffer} />
        <InputBox prevMsg={msgBuffer} setPrevMsg={setMsgBuffer} />
      </div>
      </prevMsgContext.Provider>
    )
  }
