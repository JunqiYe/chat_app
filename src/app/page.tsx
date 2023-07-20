'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState} from 'react';
import {ChatStorage} from '../storage/chat_localstorage'
import {TextData} from "../storage/text_data"

let test_userID = 'jy98'
let test_target_userID = 'jy98_clone'

const WS_URL = 'ws://localhost:8080/ws';
// var socket = new WebSocket(WS_URL)
let storage = new ChatStorage()
// let prevTextsBuffer:TextData[] = []

function connect() {
  var ws = new WebSocket(WS_URL);
  ws.onopen = function() {
    // subscribe to some channels
    ws.send(JSON.stringify({
        type: "init",
        SenderId: test_userID
    }));
  };

  ws.onmessage = function(e) {
    console.log('Message:', e.data);
  };

  ws.onclose = function(e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function() {
      connect();
    }, 1000);
  };

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };

  return ws
}

var socket = connect();

// ==========INIT============
function initTextBuffers() {

  // prevTextsBuffer = storage.getPrevTexts(test_userID, test_target_userID, 30)
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
        storage.storeText(test_userID, test_target_userID, textObj, socket)
        setTextBuffer( // Replace the state
          [ // with a new array
          textObj, // and one new item at the front
          ...textBuffer // that contains all the old items
          ]
        )
        // socket.send(textObj.text);

        // socket.send(textObj.toJson());

      }
    }
  }

}

function handleClearStorage() {
  storage.removeAll()
  window.location.reload()
}

function DEV_storageControl() {

  return (
    <div className='flex justify-normal'>
      <button className=' border-2' onClick={handleClearStorage}>clear storage</button>
    </div>
  )
}

// ==========COMPONENTS============
function UserTitle() {
  return (
    <span className='z-10 flex items-center w-full h-[3rem] bg-slate-800 p-1 rounded-t-lg pl-6'>
      {test_userID}
    </span>
  )
}

function TextBubble(text : TextData) {

  if (text.send) {
    return (
      <div className='z-9 self-end rounded-lg w-fit bg-slate-500 my-1 mx-2 p-1 text-right'>
        {text.text}
      </div>
    )
  } else {
    return (
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

function TextArea() {

  // initTextBuffers(setTextBuffer);
  const [textBuffer, setTextBuffer] = useState(storage.getPrevTexts(test_userID, test_target_userID, 30))

  return (

    <div id="TextArea" className='flex flex-col h-[45rem] w-5/6 max-w-md min-w-fit items-center justify-items-end rounded-2xl bg-slate-900'>
      {/* {PrevTexts(textBuffer)} */}
      {UserTitle()}
      {PrevTexts(textBuffer)}
      {/* <div className="chat chat-start">
        <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
      </div> */}
      {InputBox(textBuffer, setTextBuffer)}
    </div>

  )
}



export default function Home() {
  // initTextBuffers();
  // useEffect(() => {
  //     sendJsonMessage({
  //       username,
  //       type: 'userevent'
  //     });
  // }, [sendJsonMessage, readyState]);

  // return (
    // <>
    //   <Navbar color="light" light>
    //     <NavbarBrand href="/">Real-time document editor</NavbarBrand>
    //   </Navbar>
    //   <div className="container-fluid">
    //     {username ? <EditorSection/>
    //         : <LoginSection onLogin={setUsername}/> }
    //   </div>
    // </>
  // );

  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <DEV_storageControl />

      <div className="z-10 h-full w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {/* <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
        <div className="fixed top-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div> */}
        <div className="flex h-24 w-full items-center justify-end">
          <p>
            Chat App
            💬
          </p>
        </div>
      </div>

      <TextArea />



      {/* <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore the Next.js 13 playground.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div> */}
    </main>
  )
}
