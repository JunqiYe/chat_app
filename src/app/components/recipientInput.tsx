import { useState, useEffect, useContext } from "react"
import { SERVER_ADDRESS, SERVER_PORT, handler } from "./MainPage"
import { isIDValid } from "../lib/ID_helper"
import { RootState } from "../store"
import { useDispatch, useSelector } from "react-redux"
import { ConversationInfo, addNewConv } from "../convSlice"


// interface RecipientUserTitleProps {
//   convIDs: Recipients[]
//   setConvIDs: (convIDs: Recipients[]) => void
// }
export default function RecipientUserTitle() {
  const convIDs = useSelector((state: RootState) => state.convState.convsations)
  const userID = useSelector((state: RootState) => state.userState.currentUserID)
  const [userInputRecipient, setUserInputRecipient] = useState("")
  const dispatch = useDispatch()
  
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

      // find if the input is within the recipient lis
      var matchedConv = convIDs.find(obj => obj.convName == userInputRecipient)

      // input exists, terminate early
      if (matchedConv != undefined) {
        // TODO update the current conv

        
        // dispatch(
        //   changeConv()
        // )
        // handler.currentConvID = matchedConv.conversation

        // if (!ctx.prevMsg.has(matchedConv.conversation)) {

        //   // call chatHistory API to get the history for this conversation
        //   fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/chatHist?" +
        //   new URLSearchParams({convID: matchedConv.conversation}),
        //   {
        //       method: "GET",
        //       // mode:"cors",
        //       cache: "no-cache",
        //       headers:{
        //       // "Content-Type": "application/json",
        //       },
        //       // body: JSON.stringify(data)
        //   })
        //   .then(function(response) {
        //       return response.json();
        //   })
        //   .then(function(data) {
        //       // update context, handler, and react states
        //       var hist :TextData[] = []

        //       data.msgs.forEach(function(msg:any) {
        //           var msg_obj = new TextData(msg.senderID, msg.convID, 0, msg.msgData, false, msg.timestamp)
        //           hist.push(msg_obj)

        //       })

        //       console.log("[ConvIDBox]: history rst", hist)
        //       console.log("[ConvIDBox]: " + ctx.prevMsg.size)

        //       ctx.setPrevMsg(
        //           new Map(ctx.prevMsg.set(matchedConv!.conversation, hist))
        //       )
        //   })
        //   .catch(function(err) {
        //       console.log(err)
        //   })
        // }

        return
      }

      // input does not exist, check with server to get convID
      fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/convID?" +
        new URLSearchParams({senderID: userID, recipientID: userInputRecipient}),
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

          // create new recipient object
          var temp1: ConversationInfo = {
            convID: data.convID,
            convName: userInputRecipient,
            recipients: [userInputRecipient],
            }

          dispatch(
            addNewConv(temp1)
          )
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
