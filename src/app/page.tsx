'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState} from 'react';
import {ChatStorage} from '../storage/chat_localstorage'

let test_userID = 'jy98'
let storage = new ChatStorage()
let prevTextsBuffer:string[] = []

// ==========INIT============
function initTextBuffers() {

  prevTextsBuffer = storage.getPrevTexts(test_userID, 10)
  console.log(prevTextsBuffer)

  // setTextBuffer(prevTextsBuffer)
}

function updateTextBuffers(text: string) {
  prevTextsBuffer.push(text)
}


// ==========HANDLER============
function handleClientSendText(e: React.KeyboardEvent) {
  if (e.code == 'Enter') {
    let dom = document.getElementById('input_box') as HTMLInputElement
    var text = ""
    if (dom != null){
      text = dom.value
      dom.value = ''
    }

    if (text.length > 0) {
      console.log(text)
      storage.storeText(test_userID, text)
      updateTextBuffers(text)
    }
  }

}

function handleClearStorage() {
  storage.removeAll()
}

function DEV_storageControl() {

  return (
    <div className='flex justify-normal'>
      <button className=' border-2' onClick={handleClearStorage}>clear storage</button>
    </div>
  )
}

// ==========COMPONENTS============
function TextBubble(text : string) {
  return (
    <div className='flex rounded-lg min-w-fit justify-end bg-slate-500 m-0.5'>
      <p className='flex m-1 justify-end'>
        {text}
      </p>
    </div>
  )
}

function InputBox() {

  return (
    <div className="flex order-first ">
      <input className="h-8 m-0.5 rounded-t-lg outline-none bg-slate-600"
        type="text" placeholder="..."
        id='input_box'
        onKeyDown={handleClientSendText} />
    </div>
  )
}



function PrevTexts(textBuffer: string[]) {
  return (
    <>
      {textBuffer.map((text) =>
        TextBubble(text)
      )}
    </>
  )
}

function TextBoxArea() {

  // const [textBuffer, setTextBuffer] = useState([])
  // initTextBuffers(setTextBuffer);

  return (

    <div className='flex h-[35rem] w-5/6 max-w-md min-w-fit items-center justify-items-end flex-col-reverse rounded-2xl bg-slate-900'>
      {/* {PrevTexts(textBuffer)} */}
      {PrevTexts(prevTextsBuffer)}
      {/* <div className="chat chat-start">
        <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
      </div> */}
      {InputBox()}
    </div>

  )
}



export default function Home() {
  initTextBuffers();

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

      <TextBoxArea />



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
