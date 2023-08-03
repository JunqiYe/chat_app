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
      handler.currentRecipientID = userInputRecipient

      // find if the input is within the recipient lis
      var matchedConv = convIDs.find(obj => obj.recipient == userInputRecipient)

      // input exists, terminate early
      if (matchedConv != undefined) {
        ctx.setConvID(matchedConv.conversation);
        handler.currentConvID = matchedConv.recipient
        return
      }

      // input does not exist, check with server to get convID
      fetch("http://localhost:8080/api/convID?" +
        new URLSearchParams({senderID: ctx.userID, recipientID: userInputRecipient}),
        {
          method: "POST",
          // mode:"cors",
          cache: "no-cache",
          headers:{
            // "Content-Type": "application/json",
          },
          // body: JSON.stringify(data)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
          // update context, handler, and react states
          console.log("post received data ", data.convID)
          ctx.convID = data.convID
          handler.currentConvID = data.convID

          // create new recipient object
          var temp1: Recipients = {
              recipient: userInputRecipient,
              conversation: data.convID
            }

          setConvIDs([...convIDs, temp1])
        })
        .catch(function(err) {
          console.log(err)
        })
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
