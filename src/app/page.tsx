'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState, useEffect, useMemo, createContext, useContext} from 'react';
import { ChatStorage } from './lib/storage/chat_localstorage'

import { HeaderBar } from './components/header'
import { RecipientUserTitle } from './components/recipientInput';
import { PrevTexts } from './components/prevTexts';
import { InputBox } from './components/inputBox';
import Login  from './components/login';
import { userIDContext, prevMsgContext } from './components/context';
import { TextData } from './lib/storage/text_data';
import { newWorker, worker, workerSendInit, workerTerminate } from './lib/webwoker/webworker_main';

// export var userIDContext = createContext("test")

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
  const ctx = useContext(userIDContext)
  // setMsgBuffer([new TextData("", "", "", 0, ""), ...msgBuffer])
  // const msgBufferCtx = {
  //   msgBuffer: msgBuffer,
  //   setMsgBuffer: setMsgBuffer
  // }
  useEffect(() =>{
    if (worker != null) {
      worker.addEventListener("message", (e: MessageEvent) =>{
        const workerData = e.data;
        switch (workerData.connectionStatus) {
          case "add msg":
            console.log("[MAIN] received message:" + workerData.data);
            // setMsgBuffer([workerData.data, ...msgBuffer])
            var msgObj = new TextData(ctx.userID, ctx.recipientID, workerData.convID, workerData.counter, workerData.data )
            setMsgBuffer([msgObj, ...msgBuffer])
            break;
        }
      })
    }

  })

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
      newWorker()
      workerSendInit(testuserID)
    }

    return () => {
      workerTerminate()
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
