import { useState, useEffect, useContext } from "react"
import { userIDContext } from "./context"
import { workerNewRecipient } from "../lib/webwoker/webworker_main"
import { handler } from "../page"


export default function RecipientUserTitle(){
  const ctx = useContext(userIDContext)
  const [userInputRecipient, setUserInputRecipient] = useState("")

  // TODO: check if convID exists, if not, request server for convID
  function handleTargetUserSubmit(event: any) {
    if(event.key === 'Enter') {
      // TOOD update recipient id
      ctx.setRecipientID(userInputRecipient)
      handler.currentRecipientID = userInputRecipient

      handler.clientGetConvID()
        .then(
          (id) => {
          handler.currentConvID = id;
          ctx.setConvID(id)
          },
          (err) => {
            throw new Error(err)
          }
        )

      // workerNewRecipient(userInputRecipient)
    }
  }

  function handleTargetUserUpdate(event: any) {
    setUserInputRecipient(event.currentTarget.value)
  }

  return (
    <div className='z-10 flex items-center w-full h-[3rem] bg-slate-800 p-1 rounded-t-lg px-6'>
      <input className="bg-slate-800 w-full" placeholder="Search friends"  onChange={handleTargetUserUpdate} onKeyDown={handleTargetUserSubmit}></input>
    </div>
  )
}
