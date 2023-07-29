import { useContext } from "react"
import { prevMsgContext, mainAppContext } from "./context"
import { TextData } from "../lib/storage/text_data"
import { handler } from "../page"


interface InputBoxProps {
  prevMsg: Map<string, TextData[]>,
  setPrevMsg: (n:any) => void
}

export default function InputBox(props: InputBoxProps) {
    // var {prevMsg, setPrevMsg} = useContext(prevMsgContext)
    var {userID, recipientID}= useContext(mainAppContext)

    function handleClientPressSend(e: React.KeyboardEvent){
      if (e.code == 'Enter') {
        let dom = document.getElementById('input_box') as HTMLInputElement
        if (dom != null && userID != null && recipientID != null){
          if (dom.value.length > 0) {
            console.log("new message", dom.value);

            handler.clientSendMessage(dom.value)
            // workerSendNewMsg(dom.value)
          }
          dom.value = ''
        }
      }
    }

    return (
      <div id="InputBox" className="flex order-last ">
        <input className="h-8 mt-6 pl-2 rounded-t-lg outline-none bg-slate-600"
          type="text" placeholder="..."
          id='input_box'
          onKeyDown={(event)=>handleClientPressSend(event)} />
      </div>
    )
  }
