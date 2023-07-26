import { prevMsgContext } from "./context"
import { useContext, useState } from "react"
import { TextData } from "../lib/storage/text_data"

function TextBubble(text : TextData) {
    {/* <div className="chat chat-start">
      <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
    </div> */}

    if (!text.receivedFromServer) {
      return (
        // right
        <div className='z-9 self-end rounded-lg w-fit bg-slate-500 my-1 mx-2 p-1 text-right'>
          {text.text}
        </div>
      )
    } else {
      return (
        // left
        <div className='z-9 self-start rounded-lg w-fit bg-slate-500 my-1 mx-4 p-1 text-left'>
          {text.text}
        </div>
      )
    }
  }


export interface PrevTextProps {
  prevMsg: TextData[]
}
export  function PrevTexts(props: PrevTextProps) {
  var {prevMsg} = useContext(prevMsgContext)
    return (
      <div id="PrevTexts" className="flex flex-col-reverse w-full h-full overflow-y-scroll">
        {props.prevMsg.map((text: TextData) =>
          TextBubble(text)
        )}
      </div>
    )
  }
