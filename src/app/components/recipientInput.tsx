import { useState, useEffect, useContext } from "react"
import { mainAppContext } from "./context"
import { SERVER_ADDRESS, SERVER_PORT, handler } from "../page"
import { Recipients } from "./convSelector"
import { isIDValid } from "../lib/ID_helper"
import { TextData } from "../lib/storage/text_data"


interface RecipientUserTitleProps {
  convIDs: Recipients[]
  setConvIDs: (convIDs: Recipients[]) => void
}
export default function RecipientUserTitle({convIDs, setConvIDs} : RecipientUserTitleProps) {
  const ctx = useContext(mainAppContext)
  const [userInputRecipient, setUserInputRecipient] = useState("")

  // TODO: check if convID exists, if not, request server for convID
  function handleTargetUserSubmit(event: React.KeyboardEvent) {
    if(event.key === 'Enter') {

      // check recipient user input
      if (!isIDValid(userInputRecipient)) {
        alert("Please enter a valid username, use letters, numbers, _ or !")
        return
      }

      let dom = document.getElementById('recipient_input') as HTMLInputElement
      dom.value = ''
      ctx.setRecipientID(userInputRecipient)
      handler.currentRecipientID = userInputRecipient

      // find if the input is within the recipient lis
      var matchedConv = convIDs.find(obj => obj.recipient == userInputRecipient)

      // input exists, terminate early
      if (matchedConv != undefined) {
        ctx.setConvID(matchedConv.conversation);
        handler.currentConvID = matchedConv.conversation

        if (!ctx.prevMsg.has(matchedConv.conversation)) {

          // call chatHistory API to get the history for this conversation
          fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/chatHist?" +
          new URLSearchParams({convID: matchedConv.conversation}),
          {
              method: "GET",
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
              var hist :TextData[] = []

              data.msgs.forEach(function(msg:any) {
                  var msg_obj = new TextData(msg.senderID, msg.recipientID, msg.convID, 0, msg.msgData, false, msg.timestamp)
                  hist.push(msg_obj)

              })

              console.log("[ConvIDBox]: history rst", hist)
              console.log("[ConvIDBox]: " + ctx.prevMsg.size)

              ctx.setPrevMsg(
                  new Map(ctx.prevMsg.set(matchedConv!.conversation, hist))
              )
          })
          .catch(function(err) {
              console.log(err)
          })
      }

        return
      }

      // input does not exist, check with server to get convID
      fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/convID?" +
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
      <input id='recipient_input' className="z-10 flex items-center w-full h-[3rem] bg-zinc-500 rounded-tl-lg pl-3 focus:ring-4 focus:outline-none focus:ring-highlight  placeholder-gray-200  " type='text' placeholder="Search friends"  onChange={handleTargetUserUpdate} onKeyDown={handleTargetUserSubmit}></input>
    </div>
  )
}
