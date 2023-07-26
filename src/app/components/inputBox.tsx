import { useContext } from "react"
import { prevMsgContext, userIDContext } from "./context"
import { TextData } from "../lib/storage/text_data"
import { workerSendNewMsg } from "../lib/webwoker/webworker_main"


export interface InputBoxProps {
  prevMsg: TextData[],
  setPrevMsg: (n:any) => void
}
export function InputBox(props: InputBoxProps) {
    // var {prevMsg, setPrevMsg} = useContext(prevMsgContext)
    var {userID, recipientID}= useContext(userIDContext)

    function handleClientPressSend(e: React.KeyboardEvent){
      if (e.code == 'Enter') {
        let dom = document.getElementById('input_box') as HTMLInputElement
        if (dom != null && userID != null && recipientID != null){
          if (dom.value.length > 0) {
            // TODO: send message to worker, allow worker to append to prevMsg state/context
            console.log("new message", dom.value);

            workerSendNewMsg(dom.value)
          }
          dom.value = ''
        }
      }
    }

    return (
      <div id="InputBox" className="flex order-last ">
        <input className="h-8 mt-3 pl-2 rounded-t-lg outline-none bg-slate-600"
          type="text" placeholder="..."
          id='input_box'
          onKeyDown={(event)=>handleClientPressSend(event)} />
      </div>
    )
  }
