'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState, useEffect, useMemo, createContext, useContext, useRef} from 'react';
import { ChatStorage } from './lib/storage/chat_localstorage'

import { mainAppContext, prevMsgContext } from './components/context';
import TextArea from './components/textArea';
import HeaderBar from './components/header'
import Login  from './components/login';
import { MessageHandler } from './lib/msgHandler/handler';
import ConversationsSelect from './components/convSelector';
import { TextData } from './lib/storage/text_data';
// export const SERVER_ADDRESS = "localhost"
// export const SERVER_ADDRESS = "192.168.0.103"
import address from '../../package.json'
export const SERVER_ADDRESS = address.address
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
if (typeof Notification !== 'undefined') {
  Notification.requestPermission().then((result) => {
    console.log(result);
  });
}

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


  function newMessageCallback(message: TextData) {
    console.log("[PAGE]: new message callback");
    var convBuffer = msgBuffer.get(message.convID)

    if (convBuffer === undefined) {
      convBuffer = []
    }

    if (!window.focus && message.userID != userID) {
      console.log("triggering notification")
      new Notification("chat app", { body: message.userID + " " + message.text});
    }

    console.log("[PAGE]: " + msgBuffer.size)
    setMsgBuffer(
      new Map(msgBuffer.set(message.convID, [message, ...convBuffer]))
    )
  }

  // use effect hook to updatet the newmessagecallback reference everytime the component is rendered...
  useEffect(() => {
    if (handler!= undefined) {
      handler.websocket.onmessage = (e: MessageEvent) => { handler.clientReceiveMessage(e, newMessageCallback)}
    }
  })


  useEffect(() => {

    // check if the user already signed in and skip auth using stored cookies
    fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/", {
      method: "GET",
      credentials: 'include'
    }).then(response =>{
      if (response.status === 200) {
        return response.json();
      }
      return null
      // console.log(response.json());
    }).then((data)=>{
      // valid response from server, allow login
      if (data != null) {
        setLoggedIn(true)
        setUserID(data.user_id)
      }
    }).catch(error => {
      console.log(error)
    })

    // init the Message handler after login is successful
    if (loggedIn) {
      var socket = new WebSocket(WS_URL)
      var storage = new ChatStorage()
      handler = new MessageHandler(userID, socket, storage);

      handler.websocket.onmessage = (e: MessageEvent) => { handler.clientReceiveMessage(e, newMessageCallback)}
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
