import { TextData } from "../lib/storage/text_data"
import { TextDatav2 } from "../messagesSlice"
import { RootState } from "../store"
import { useSelector } from "react-redux"

interface TextBubbleProps {
  textObj: TextDatav2
}
function TextBubble({textObj} : TextBubbleProps) {
    {/* <div className="chat chat-start">
      <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
    </div> */}
    let userID = useSelector((state: RootState) => state.userState.currentUserID)
    
    if (textObj.userID == userID) {
      return (
        // right
        <div id="self" className='z-9 self-end rounded-lg w-fit bg-slate-500 my-1 mx-2 p-1 text-right'>
          {textObj.msgData}
        </div>
      )
    } else {
      return (
        // left
        <div id="other" className='z-9 self-start rounded-lg w-fit bg-slate-500 my-1 mx-4 p-1 text-left'>
          {textObj.msgData}
        </div>
      )
    }
  }


// display the list of text object for the current conversation
// each text object has a TextBubble associated with it
export default function PrevTexts() {
  let msgs = useSelector((state: RootState) => state.messageHistory.history)

    return (
      <div id="PrevTexts" className="flex flex-col-reverse w-full h-full max-h-full overflow-y-scroll no-scrollbar">
        { msgs != undefined ?
          msgs.map((text: TextDatav2) => (
            <TextBubble key={text.convID + '_' + text.timestamp} textObj={text} />
          ))
          :
          <></>
        }
      </div>
    )
  }
