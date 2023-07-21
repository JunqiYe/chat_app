'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState} from 'react';
import {ChatStorage} from './storage/chat_localstorage'
import {TextData} from "./storage/text_data"
import {useRouter} from 'next/navigation'

let userID: string | null
let target_userID: string | null
target_userID = null
let test_target_userID = 'jy98_clone'

let storage = new ChatStorage()

let socket: WebSocket

// var socket = connect();

// ==========INIT============
function initTextBuffers() {

  // prevTextsBuffer = storage.getPrevTexts(userID, test_target_userID, 30)
  // console.log("init buffer", prevTextsBuffer)

  // setTextBuffer(prevTextsBuffer)
}

// function updateTextBuffers(text: TextData) {
//   prevTextsBuffer.push(text)
// }


// ==========HANDLER============
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
          storage.storeText(userID, target_userID, textObj, socket)
          setTextBuffer( // Replace the state
            [ // with a new array
            textObj, // and one new item at the front
            ...textBuffer // that contains all the old items
            ]
          )
        }
        // socket.send(textObj.text);

        // socket.send(textObj.toJson());

      }
    }
  }

}



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
function DestUserTitle(recipientID: string, setRecipientID: (n:any) => any, setTextBuffer: (n:any) => any){
  function handleTargetUserSubmit(event: any) {
    // setRecipientID(event.target.value)
    if(event.key === 'Enter') {
      target_userID = recipientID
      setTextBuffer(storage.getPrevTexts(userID, target_userID, 30))
    }
    // console.log(recipientID)
    console.log(target_userID)
  }

  function handleTargetUserUpdate(event: any) {
    setRecipientID(event.target.value)
  }

  return (
    <div className='z-10 flex items-center w-full h-[3rem] bg-slate-800 p-1 rounded-t-lg px-6'>
      <input className="bg-slate-800 w-full" placeholder="Search friends" value={recipientID} onChange={handleTargetUserUpdate} onKeyDown={handleTargetUserSubmit}></input>
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

  return (
    <div id="InputBox" className="flex order-last ">
      <input className="h-8 mt-3 pl-2 rounded-t-lg outline-none bg-slate-600"
        type="text" placeholder="..."
        id='input_box'
        onKeyDown={(event)=>handleClientSendText(event, textBuffer, setTextBuffer)} />
    </div>
  )
}

function TextArea(textBuffer: TextData[], setTextBuffer: (n:any) => void) {

  // initTextBuffers(setTextBuffer);
  const [userInputRecipient, setUserInputRecipient] = useState('')

  return (

    <div id="TextArea" className='flex flex-col h-[45rem] w-full max-w-md min-w-fit items-center justify-items-end rounded-2xl bg-slate-900'>
      {/* {PrevTexts(textBuffer)} */}
      {DestUserTitle(userInputRecipient, setUserInputRecipient, setTextBuffer)}
      {PrevTexts(textBuffer)}
      {/* <div className="chat chat-start">
        <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
      </div> */}
      {InputBox(textBuffer, setTextBuffer)}
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

export default function Home() {
  // redirect('/login')
  // initTextBuffers();
  // useEffect(() => {
  //     sendJsonMessage({
  //       username,
  //       type: 'userevent'
  //     });
  // }, [sendJsonMessage, readyState]);
  const WS_URL = 'ws://localhost:8080/ws';
  // var socket = new WebSocket(WS_URL)
  // let prevTextsBuffer:TextData[] = []
  const [textBuffer, setTextBuffer] = useState(storage.getPrevTexts(userID, target_userID, 30))


  function connect() {
    var ws = new WebSocket(WS_URL);
    ws.onopen = function() {
      // subscribe to some channels
      ws.send(JSON.stringify({
          type: "init",
          SenderId: userID
      }));
    };

    ws.onmessage = function(e) {
      console.log('Message:', e.data);
      var msg = JSON.parse(e.data)
      var textObj = new TextData(msg.msgData, false, true);

      setTextBuffer( // Replace the state
      [ // with a new array
      textObj, // and one new item at the front
      ...textBuffer // that contains all the old items
      ]
      )
    };

    ws.onclose = function(e) {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
        connect();
      }, 1000);
    };

    ws.onerror = function(err) {
      console.error('Socket encountered error: ', err, 'Closing socket');
      ws.close();
    };

    return ws
  }

  socket = connect();



  if (typeof window !== "undefined" && window.location !== undefined) {
    // Client-side-only code
    const urlParams = new URLSearchParams(window.location.search);
    userID = urlParams.get('username')
  }
  const router = useRouter()
  if (userID == null) {
    router.push('/login')
  }

  console.log("current userID", userID)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DEV_storageControl />

      <HeaderBar />

      {/* <TextArea /> */}
      {TextArea(textBuffer, setTextBuffer)}
    </main>
  )
}
