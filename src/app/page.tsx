'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState, useEffect, useMemo} from 'react';
import { ChatStorage } from './storage/chat_localstorage'
import { TextData } from "./storage/text_data"
import { useRouter } from 'next/navigation'
import { webSocketConnect } from './websocket/websocket_client'
import { MessageHandler } from './msgHandler/handler'

export var userID: string | null = null
export var target_userID: string | null = null
export function updateUserID(newID: string) {
  userID = newID
}

var handler: MessageHandler | undefined= undefined
var storage: ChatStorage = new ChatStorage()


function DEV_storageControl() {
  function handleClearStorage() {
    storage.removeAll()
    if (typeof window !== "undefined" && window.location !== undefined) {
      // Client-side-only code
      window.location.reload()
    }
  }

  return (
    <div className='flex justify-normal'>
      <button className=' border-2' onClick={handleClearStorage}>clear storage</button>
    </div>
  )
}

// ==========COMPONENTS============
function RecipientUserTitle(handler: MessageHandler){
  const [userInputRecipient, setUserInputRecipient] = useState("")

  // TODO: check if convID exists, if not, request server for convID
  function handleTargetUserSubmit(event: any) {
    if(event.key === 'Enter') {
      target_userID = userInputRecipient
      let convID = handler.getCurrentConvID(target_userID)
      var temp = storage.getPrevTexts(convID, 30)
      handler.setTextBuffer(temp)

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

function TextBubble(text : TextData) {
  {/* <div className="chat chat-start">
    <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
  </div> */}

  if (!text.receivedFromServer) {
    return (
      // right
      <div className='z-9 self-end rounded-lg w-fit bg-slate-500 my-1 mx-2 p-1 text-right'>
        {text.text}
      </div>
    )
  } else {
    return (
      // left
      <div className='z-9 self-start rounded-lg w-fit bg-slate-500 my-1 mx-4 p-1 text-left'>
        {text.text}
      </div>
    )
  }
}

function PrevTexts(handler: MessageHandler) {
  return (
    <div id="PrevTexts" className="flex flex-col-reverse w-full h-full overflow-y-scroll">
      {handler.textBuffer.map((text) =>
        TextBubble(text)
      )}
    </div>
  )
}

function InputBox(handler: MessageHandler) {
  function handleClientPressSend(e: React.KeyboardEvent, handler: MessageHandler){
    if (e.code == 'Enter') {
      let dom = document.getElementById('input_box') as HTMLInputElement
      if (dom != null && userID != null && target_userID != null){
        if (dom.value.length > 0) {
            handler.clientSendMessage(target_userID, dom.value)
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
        onKeyDown={(event)=>handleClientPressSend(event, handler)} />
    </div>
  )
}

function HeaderBar() {
  return (
    <div className="z-10 flex flex-row h-full w-full max-w-md items-center justify-between p-4 font-mono text-sm lg:flex">
        <p>Chat App 💬</p>
        <p>{userID}</p>
    </div>
  )
}

function TextArea(handler: MessageHandler) {

  return (

    <div id="TextArea" className='flex flex-col h-[45rem] w-full max-w-md min-w-fit items-center justify-items-end rounded-2xl bg-slate-900'>
      {RecipientUserTitle(handler)}
      {PrevTexts(handler)}
      {InputBox(handler)}
    </div>

  )
}

export default function Home() {
  const WS_URL = 'ws://localhost:8080/ws';

  const [textBuffer, setTextBuffer] = useState([])

  const router = useRouter()
  useEffect(() => {
    if (userID == null) {
      router.push('/login')
    }
  })

  if (userID == null) {
    return (
      <div className='flex h-screen items-center justify-center'>
        Loading...
      </div>
    )
  }

  let socket = webSocketConnect(WS_URL)
  if (socket == null) {
    handler = undefined;
  } else {
    handler = new MessageHandler(socket, storage, textBuffer, setTextBuffer);
  }



  if (handler == undefined) {
    return (
      <main>
        <p> failed to connect to server, waiting to reconnect </p>
      </main>
    )
  } else {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <DEV_storageControl />

        <HeaderBar />

        {TextArea(handler)}
      </main>
    )
  }

}
