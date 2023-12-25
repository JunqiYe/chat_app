import { handler } from "./MainPage"
import { useSelector } from "react-redux"
import { RootState } from "../state/store"


export default function InputBox() {
    let userID = useSelector((state: RootState) => state.userState.currentUserID)
    let currConv = useSelector((state: RootState) => state.convState.currentConv)
    function handleClientPressSend(e: React.KeyboardEvent){
      if (e.code == 'Enter'){
        let dom = document.getElementById('input_box') as HTMLInputElement
        if (dom != null && userID != null){
          if (dom.value.length > 0) {
            console.log("new outgoing message", dom.value);

            if (currConv == null) {
              // user didn't select a conversation
              return
            }
            handler.clientSendMessage(currConv, dom.value)
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
