import { MessageHandler } from "../msgHandler/handler"
import { userID, target_userID } from "../page"

export function InputBox() {
    function handleClientPressSend(e: React.KeyboardEvent){
      if (e.code == 'Enter') {
        let dom = document.getElementById('input_box') as HTMLInputElement
        if (dom != null && userID != null && target_userID != null){
          if (dom.value.length > 0) {
              
            // clientSendMessage(target_userID, dom.value)
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
