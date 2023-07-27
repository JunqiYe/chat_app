'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState, useEffect, useMemo, createContext, useContext} from 'react';
import { ChatStorage } from './lib/storage/chat_localstorage'

import { mainAppContext, prevMsgContext } from './components/context';
import { TextData } from './lib/storage/text_data';
import { newWorker, worker, workerSendInit, workerTerminate } from './lib/webwoker/webworker_main';
import TextArea from './components/textAera';
import HeaderBar from './components/header'
import Login  from './components/login';
// import { WS_URL } from './lib/webwoker/webworker_thread';
import { MessageHandler } from './lib/msgHandler/handler';
import Conversations from './components/convSelector';
import ConversationsSelect from './components/convSelector';
export const WS_URL = 'ws://localhost:8080/ws';


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
      handler = new MessageHandler(socket, storage);
      handler.currentUserID = userID
      // newWorker()
      // workerSendInit(userID)
    }

    return () => {
      // workerTerminate()
    }
  },[loggedIn, userID])



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
      <mainAppContext.Provider value={{
        signedIn: loggedIn,
        setSignIn: setLoggedIn,
        userID: userID,
        setUserID: setUserID,
        recipientID: recipientID,
        setRecipientID: setrecipientID,
        convID: convID,
        setConvID: setconvID}}>

      <main className="flex min-h-screen flex-col items-center justify-between p-24">

        {/* {!loggedIn ? <Login onLogin={(status) => {setLoggedIn(status)}}/> : <Area />} */}
        {!loggedIn ?
        <Login />
         :
         <div>
          <div>
            <DEV_storageControl />
            <HeaderBar />
          </div>
          <div className='flex flex-row'>
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
