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
import { TextData } from './lib/storage/text_data';
export const SERVER_ADDRESS = "192.168.0.103"
export const SERVER_PORT = ":8080"
export const WS_URL = 'ws://' + SERVER_ADDRESS + SERVER_PORT + '/ws';
// export const WS_URL = 'ws://localhost:8080/ws';


// let swRegistration: ServiceWorkerRegistration | null = null
// navigator.serviceWorker.register('lib/serviceWorker/sw.ts')
//   .then(function(swReg) {
//     console.log('Service Worker is registered', swReg);

//     swRegistration = swReg;
//   })
//   .catch(function(error) {
//     console.error('Service Worker Error', error);
//   })

// Notification.requestPermission().then((result) => {
//   console.log(result);
// });

// const text = `HEY! Your task is now overdue.`;
// const notification = new Notification("To do list", { body: text });

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
  const [msgBuffer, setMsgBuffer] = useState<Map<string, TextData[]>>(new Map<string, TextData[]>());

  useEffect(() => {
    // fetch("http://" + "localhost:8080" + "/", {
    fetch("http://" + "192.168.0.103:8080" + "/", {
      method: "GET",
      credentials: 'include'
    }).then(response =>{
      if (response.status === 200) {
        return response.json();
      }
      return null
      // console.log(response.json());
    }).then((data)=>{
      if (data != null) {
        setLoggedIn(true)
        setUserID(data.user_id)
      }
    }).catch(error => {
      console.log(error)
    })

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
        setConvID: setconvID,
        prevMsg: msgBuffer,
        setPrevMsg: setMsgBuffer
        }}>

      <main className="flex h-screen w-screen items-center justify-center p-0 md:p-16">
        {/* {!loggedIn ? <Login onLogin={(status) => {setLoggedIn(status)}}/> : <Area />} */}
        {!loggedIn ?
          <Login />
         :
         <div className='flex flex-col h-full w-full max-h-full max-w-3xl justify-center items-center'>
           <HeaderBar />
            {/* <DEV_storageControl /> */}

            <div id="main area" className='flex h-[93%] w-full  rounded-2xl bg-slate-900'>
                <div id="wrapper" className='flex flex-initial flex-row h-full w-full'>
                  <ConversationsSelect />
                  <TextArea />
                </div>
            </div>
         </div>
         }

      </main>

      </mainAppContext.Provider>
    )
  // }

}
