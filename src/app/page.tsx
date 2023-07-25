'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState, useEffect, useMemo, createContext} from 'react';
import { ChatStorage } from './storage/chat_localstorage'

import { HeaderBar } from './components/header'
import { RecipientUserTitle } from './components/recipientInput';
import { PrevTexts } from './components/prevTexts';
import { InputBox } from './components/inputBox';
import Login  from './components/login';
import { userIDContext } from './ctx';

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

// ==========COMPONENTS============
function TextArea() {

  return (
    <div id="TextArea" className='flex flex-col h-[45rem] w-full max-w-md min-w-fit items-center justify-items-end rounded-2xl bg-slate-900'>
      {RecipientUserTitle()}
      {/* {PrevTexts()} */}
      {InputBox()}
    </div>
  )
}


export default function Home() {
  const [testuserID, settestuserID] = useState<string>()


  // const router = useRouter()
  // useEffect(() => {
  //   // if (userID == null) {
  //   //   router.push('/login')
  //   // }


  // })

  useEffect(() => {
    if (testuserID != undefined) {
      userID = testuserID
      worker = new Worker(
        new URL("./worker/webworker.tsx", import.meta.url)
      );

      console.log("new worker,", worker)
      worker.postMessage({
        connectionStatus: "init",
      });
    }

    return () => {
      if (worker != null) {
        worker!.terminate();
      }
    }
  },[testuserID])


  if (testuserID == undefined) {
    return (
      Login(settestuserID)
    )
  }




  // if (userID == null) {
  //   return (
  //     <div className='flex h-screen items-center justify-center'>
  //       Loading...
  //     </div>
  //   )
  // }

  // if (handler == undefined) {
  //   return (
  //     <main>
  //       <p> failed to connect to server, waiting to reconnect </p>
  //     </main>
  //   )
  // } else {

    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <DEV_storageControl />

        <userIDContext.Provider value={{userID:testuserID, recipientID: ""}}>
          {HeaderBar()}
        </userIDContext.Provider>

        {TextArea()}
      </main>
    )
  // }

}
