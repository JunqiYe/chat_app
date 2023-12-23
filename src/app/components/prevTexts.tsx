import { useEffect } from "react"
import { TextDatav2, newMessageHist } from "../messagesSlice"
import { RootState } from "../store"
import { useDispatch, useSelector } from "react-redux"
import { SERVER_ADDRESS, SERVER_PORT } from "./MainPage"

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
	let convInfo = useSelector((state: RootState) => state.convState.currentConv)
	let dispatch = useDispatch()

	// side effect for updating message history whenever selected conversation is updated
	useEffect(() => {
		if (convInfo == null) {
			// do not fetch message history if convInfo is not undefined/null
			return
		}
		// TODO: removed checking for if message history exists, might need to optimize later

		// call chatHistory API to get the history for this conversation
		fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/chatHist?" +
		new URLSearchParams({convID: convInfo.convID}),
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
			var hist :TextDatav2[] = []

			data.msgs.forEach(function(msg:any) {
				hist.push({
					userID: msg.senderID,
					convID: msg.convID,
					timestamp: msg.timestamp,
					msgData: msg.msgData,
					isImg: false,
				} as TextDatav2)
			})

			console.log("[ConvIDBox]: history rst", hist)

			// set the message history state
			dispatch(
				newMessageHist(hist)
			)
		})
		.catch(function(err) {
			console.log(err)
		})

	}, [convInfo, dispatch])

	return (
	  <div id="PrevTexts" className="flex flex-col-reverse w-full h-full max-h-full overflow-y-scroll no-scrollbar">
		{msgs.map((text: TextDatav2) => (
			<TextBubble key={text.convID + '_' + text.timestamp} textObj={text} />
		))}
	  </div>
	)
  }
