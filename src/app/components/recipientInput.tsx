import { useState, useEffect, useContext } from "react"
import { mainAppContext } from "./context"
import { handler } from "../page"
import { Recipients } from "./convSelector"
import { isIDValid } from "../lib/ID_helper"


interface RecipientUserTitleProps {
  convIDs: Recipients[]
  setConvIDs: (convIDs: Recipients[]) => void
}
export default function RecipientUserTitle({convIDs, setConvIDs} : RecipientUserTitleProps) {
  const ctx = useContext(mainAppContext)
  const [userInputRecipient, setUserInputRecipient] = useState("")

  // TODO: check if convID exists, if not, request server for convID
  function handleTargetUserSubmit(event: any) {
    if(event.key === 'Enter') {

      // check recipient user input
      if (!isIDValid(userInputRecipient)) {
        alert("Please enter a valid username, use letters, numbers, _ or !")
        return
      }

      event.target.value = ''
      ctx.setRecipientID(userInputRecipient)


      var matchedConv = convIDs.find(obj => obj.recipient == userInputRecipient)
      if (matchedConv != undefined) {
        ctx.setConvID(matchedConv.conversation);

        return
      }


      handler.currentRecipientID = userInputRecipient

      handler.clientGetConvID()
        .then(
          (id) => {
          handler.currentConvID = id;
          ctx.setConvID(id)
          var newRecipient: Recipients = {
            recipient: userInputRecipient,
            conversation: id
          }

          setConvIDs([...convIDs, newRecipient])
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
