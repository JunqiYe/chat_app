import { useState } from "react"
import { MessageHandler } from "../msgHandler/handler"

import { worker, target_userID } from "../page"

export function RecipientUserTitle(){
  const [userInputRecipient, setUserInputRecipient] = useState("")

  // TODO: check if convID exists, if not, request server for convID
  function handleTargetUserSubmit(event: any) {
    if(event.key === 'Enter') {
      // TOOD update recipient id
      // updateTargetUserID(userInputRecipient)
      
      // let convID = handler.getCurrentConvID(target_userID)
      // var temp = storage.getPrevTexts(convID, 30)
      // handler.setTextBuffer(temp)

      console.log(target_userID)
    }
  }

  function handleTargetUserUpdate(event: any) {
    setUserInputRecipient(event.target.value)
  }

  return (
    <div className='z-10 flex items-center w-full h-[3rem] bg-slate-800 p-1 rounded-t-lg px-6'>
      <input className="bg-slate-800 w-full" placeholder="Search friends" value={userInputRecipient} onChange={handleTargetUserUpdate} onKeyDown={handleTargetUserSubmit}></input>
    </div>
  )
}
