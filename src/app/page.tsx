'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState, useEffect, useMemo} from 'react';
import {ChatStorage} from './storage/chat_localstorage'
import {TextData} from "./storage/text_data"
import {useRouter} from 'next/navigation'
import {webScoketConnect} from './websocket/websocket_client'


export var userID: string | null = null
export var target_userID: string | null = null
export function updateUserID(newID: string) {
  userID = newID
}
export var socket: WebSocket 

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
function RecipientUserTitle(setTextBuffer: (n:any) => any){
  const [userInputRecipient, setUserInputRecipient] = useState('')

  function handleTargetUserSubmit(event: any) {
    if(event.key === 'Enter') {
      target_userID = userInputRecipient
      setTextBuffer(storage.getPrevTexts(userID, target_userID, 30))
    }
    // console.log(userInputRecipient)
    console.log(target_userID)
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

function PrevTexts(textBuffer: TextData[]) {
  return (
    <div id="PrevTexts" className="flex flex-col-reverse w-full h-full overflow-y-scroll">
      {textBuffer.map((text) =>
        TextBubble(text)
      )}
    </div>
  )
}

function InputBox(textBuffer: TextData[], setTextBuffer: (n:any) => any) {
  function handleClientSendText(e: React.KeyboardEvent, textBuffer: TextData[], setTextBuffer: (n:any)=>any){
    if (e.code == 'Enter') {
      let dom = document.getElementById('input_box') as HTMLInputElement
      var textObj = null
      if (dom != null){
        textObj = new TextData(dom.value)
        dom.value = ''

        if (textObj.text.length > 0) {
          console.log('send ',textObj)
          if (userID != null && target_userID != null) {
            storage.storeText(userID, target_userID, textObj)

            setTextBuffer([textObj, ...textBuffer])
          }
        }
      }
    }
  }

  return (
    <div id="InputBox" className="flex order-last ">
      <input className="h-8 mt-3 pl-2 rounded-t-lg outline-none bg-slate-600"
        type="text" placeholder="..."
        id='input_box'
        onKeyDown={(event)=>handleClientSendText(event, textBuffer, setTextBuffer)} />
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

function TextArea(textBuffer: TextData[], setTextBuffer: (n:any) => void) {

  return (

    <div id="TextArea" className='flex flex-col h-[45rem] w-full max-w-md min-w-fit items-center justify-items-end rounded-2xl bg-slate-900'>
      {/* {PrevTexts(textBuffer)} */}
      {RecipientUserTitle(setTextBuffer)}
      {PrevTexts(textBuffer)}
      {/* <div className="chat chat-start">
        <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
      </div> */}
      {InputBox(textBuffer, setTextBuffer)}
    </div>

  )
}

export default function Home() {
  const WS_URL = 'ws://localhost:8080/ws';

  const [textBuffer, setTextBuffer] = useState(storage.getPrevTexts(userID, target_userID, 30))

  var tempsocket = webScoketConnect(WS_URL, textBuffer, setTextBuffer);
  if (tempsocket != null) {
    socket = tempsocket
  }

  const router = useRouter()
  useEffect(() => {
    if (userID == null) {
      router.push('/login')
    }
  })

  if (userID == null) {
    return (
      <div className='place-items-center items-center justify-center'>
        Loading...
      </div>
    )
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DEV_storageControl />

      <HeaderBar />

      {/* <TextArea /> */}
      {TextArea(textBuffer, setTextBuffer)}
    </main>
  )
}
