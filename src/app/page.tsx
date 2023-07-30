'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState, useEffect, useMemo, createContext, useContext} from 'react';
import { ChatStorage } from './lib/storage/chat_localstorage'

import { mainAppContext, prevMsgContext } from './components/context';
import TextArea from './components/textAera';
import HeaderBar from './components/header'
import Login  from './components/login';
import { MessageHandler } from './lib/msgHandler/handler';
import ConversationsSelect from './components/convSelector';
export const WS_URL = 'ws://localhost:8080/ws';



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


export var handler : MessageHandler

// ==========COMPONENTS============
export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [userID, setUserID] = useState<string>("")
  const [recipientID, setrecipientID] = useState<string>("")
  const [convID, setconvID] = useState<string>("")

  useEffect(() => {
    if (loggedIn) {
      var socket = new WebSocket(WS_URL)
      var storage = new ChatStorage()
      handler = new MessageHandler(userID, socket, storage);
      // newWorker()
      // workerSendInit(userID)
    }

    return () => {
      // workerTerminate()
    }
  },[loggedIn, userID])

    return (
      <mainAppContext.Provider value={{
        signedIn: loggedIn,
        setSignIn: setLoggedIn,
        userID: userID,
        setUserID: setUserID,
        recipientID: recipientID,
        setRecipientID: setrecipientID,
        convID: convID,
        setConvID: setconvID}}>

      <main className="flex h-screen w-screen items-center justify-center p-0 md:p-16">

        {/* {!loggedIn ? <Login onLogin={(status) => {setLoggedIn(status)}}/> : <Area />} */}
        {!loggedIn ?
          <Login />
         :
         <div className='flex flex-col h-full w-full max-w-3xl justify-center items-center'>
           <HeaderBar />
            {/* <DEV_storageControl /> */}

            <div id="main area" className='flex flex-initial flex-row basis-11/12 w-full rounded-2xl bg-slate-900'>
                <ConversationsSelect />
                <TextArea />
            </div>
         </div>
         }

      </main>

      </mainAppContext.Provider>
    )
  // }

}
