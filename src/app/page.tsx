'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState, useEffect, useMemo, createContext} from 'react';
import { ChatStorage } from './lib/storage/chat_localstorage'

import { HeaderBar } from './components/header'
import { RecipientUserTitle } from './components/recipientInput';
import { PrevTexts } from './components/prevTexts';
import { InputBox } from './components/inputBox';
import Login  from './components/login';
import { userIDContext, prevMsgContext } from './components/context';
import { TextData } from './lib/storage/text_data';

// export var userIDContext = createContext("test")

export var worker : Worker | null = null
export var userID: string | null = null
export var target_userID: string | null = null
// export function updateUserID(newID: string) {
//   userID = newID
// }
// export function updateTargetUserID(newID: string) {
//   target_userID = newID
// }



function DEV_storageControl() {
  var storage: ChatStorage = new ChatStorage()

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

function isIDValid(id: string) : boolean {
  if (id.length < 4) return false

  return true
}

// ==========COMPONENTS============
function TextArea() {
  const [msgBuffer, setMsgBuffer] = useState<TextData[]>([])

  // setMsgBuffer([new TextData("", "", "", 0, ""), ...msgBuffer])
  // const msgBufferCtx = {
  //   msgBuffer: msgBuffer,
  //   setMsgBuffer: setMsgBuffer
  // }

  return (
    <prevMsgContext.Provider value = {{prevMsg: msgBuffer, setPrevMsg:setMsgBuffer}}>
    <div id="TextArea" className='flex flex-col h-[45rem] w-full max-w-md min-w-fit items-center justify-items-end rounded-2xl bg-slate-900'>
      {RecipientUserTitle()}
      <PrevTexts prevMsg={msgBuffer} />
      <InputBox prevMsg={msgBuffer} setPrevMsg={setMsgBuffer} />
    </div>
    </prevMsgContext.Provider>
  )
}

function MsgScreen() {
  return (
    <>
    <DEV_storageControl />

    {HeaderBar()}

    {TextArea()}
    </>

  )
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [testuserID, settestuserID] = useState<string>("")
  const [recipientID, setrecipientID] = useState<string>("")

  useEffect(() => {
    if (loggedIn) {
      userID = testuserID
      worker = new Worker(
        new URL("./worker/webworker.tsx", import.meta.url)
      );

      console.log("[MAIN]: new worker,", worker)
      worker.postMessage({
        connectionStatus: "init",
      });
    }

    return () => {
      if (worker != null) {
        worker!.terminate();
      }
    }
  },[loggedIn, testuserID])



  // if (userID == null) {
  //   return (
  //     <div className='flex h-screen items-center justify-center'>
  //       Loading...
  //     </div>
  //   )
  // }

  // if (handler == undefined) {
  //   return (
  //     <div>
  //       <p> failed to connect to server, waiting to reconnect </p>
  //     </div>
  //   )
  // } else {



    return (
      <userIDContext.Provider value={{signedIn: loggedIn, setSignIn: setLoggedIn, userID: testuserID, setUserID: settestuserID, recipientID: recipientID, setRecipientID: setrecipientID}}>

      <main className="flex min-h-screen flex-col items-center justify-between p-24">

        {/* {!loggedIn ? <Login onLogin={(status) => {setLoggedIn(status)}}/> : <Area />} */}
        {!loggedIn ? <Login /> : <MsgScreen />}

      </main>

      </userIDContext.Provider>
    )
  // }

}
