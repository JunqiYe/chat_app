import { mainAppContext, prevMsgContext } from "./context"
import { useContext, useState } from "react"
import { TextData } from "../lib/storage/text_data"

interface TextBubbleProps {
  text: TextData
}

function TextBubble({text} : TextBubbleProps) {
    {/* <div className="chat chat-start">
      <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
    </div> */}
    const ctx = useContext(mainAppContext)
    
    if (text.userID == ctx.userID) {
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


interface PrevTextProps {
  prevMsg: Map<string, TextData[]>
}
export default function PrevTexts(props: PrevTextProps) {
  // var {prevMsg} = useContext(prevMsgContext)
  const ctx = useContext(mainAppContext)
  let msgs = props.prevMsg.get(ctx.convID)

    return (
      <div id="PrevTexts" className="flex flex-col-reverse w-full h-full max-h-full overflow-y-scroll no-scrollbar">
        { msgs != undefined ?
          msgs.map((text: TextData) => (
            <TextBubble key={text.convID + '_' + text.counter} text={text} />
          ))
          :
          <></>
        }
      </div>
    )
  }
