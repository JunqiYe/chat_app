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
    <div className=''>
      <input className="z-10 flex items-center w-full h-[3rem] bg-zinc-500 rounded-tl-lg pl-3 focus:ring-4 focus:outline-none focus:ring-highlight  placeholder-gray-200  " type='text' placeholder="Search friends"  onChange={handleTargetUserUpdate} onKeyDown={handleTargetUserSubmit}></input>
    </div>
  )
}
