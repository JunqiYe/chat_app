'use client'

import Image from 'next/image'
import React, {KeyboardEvent, useState, useEffect, useMemo, createContext, useContext, useRef} from 'react';
import { ChatStorage } from '../lib/storage/chat_localstorage'

import TextArea from './textArea';
import HeaderBar from './header'
import Login  from './login';
import { MessageHandler } from '../lib/msgHandler/handler';
import ConversationPanel from './convSelector';
// export const SERVER_ADDRESS = "localhost"
// export const SERVER_ADDRESS = "192.168.0.103"
import address from '../../../package.json'

import { useDispatch, useSelector } from 'react-redux'
import { userLogin} from '../userSlice'
import { RootState } from '../store';
import { TextDatav2, addNewMessage } from '../messagesSlice';

export const SERVER_ADDRESS = address.address
export const SERVER_PORT = ":8080"
export const WS_URL = 'ws://' + SERVER_ADDRESS + SERVER_PORT + '/ws';
// export const WS_URL = 'ws://localhost:8080/ws';

// requestion permission for notification
if (typeof Notification !== 'undefined') {
	Notification.requestPermission().then((result) => {
		console.log("[MainPage]: notification permission:", result);
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
export default function MainPage() {
	// redux store
	const loggedIn = useSelector((state: RootState) => state.userState.loggedIn)
	const userID = useSelector((state: RootState) => state.userState.currentUserID)
	const currConv = useSelector((state: RootState) => state.convState.currentConv)
	const dispatch = useDispatch()
	
	function newMessageCallback(message: TextDatav2) {
		console.log("[MainPage]: new message callback");

		// check if the message belongs to the current conversation
		if (currConv == null || message.convID != currConv.convID) {
			return
		}

		dispatch(
			addNewMessage(message)
			)
			console.log("[MainPage]: add new message to redux store")

		// if (!window.focus && message.userID != userID) {
		//   console.log("triggering notification")
		//   new Notification("chat app", { body: message.userID + " " + message.text});
		// }
	}

	// use effect hook to updatet the newmessagecallback reference everytime the component is rendered...
	useEffect(() => {
		if (handler!= undefined) {
			handler.websocket.onmessage = (e: MessageEvent) => { handler.clientReceiveMessage(e, newMessageCallback)}
		}
	})


	// useEffort for checking the session cookie and allow quick login
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
		}).then((data)=>{
			// valid response from server, allow login
			if (data != null) {
				dispatch(
					userLogin(data.user_id)
				)
			}
		}).catch(error => {
			console.log(error)
		})

	})

	useEffect(() => {
		// init the Message handler after login is successful
		if (loggedIn) {
			var socket = new WebSocket(WS_URL)
			var storage = new ChatStorage()
			handler = new MessageHandler(userID, socket, storage);

			handler.websocket.onmessage = (e: MessageEvent) => { handler.clientReceiveMessage(e, newMessageCallback)}
		}
	},[loggedIn, userID])

		return (
			<main className="flex h-screen w-screen items-center justify-center p-0 md:p-16">
				{!loggedIn ?
					<Login />
					:
					<div className='flex flex-col h-full w-full max-h-full max-w-3xl justify-center items-center'>
						<HeaderBar />
						{/* <DEV_storageControl /> */}

						<div id="main area" className='flex h-[93%] w-full  rounded-2xl bg-slate-900'>
								<div id="wrapper" className='flex flex-initial flex-row h-full w-full'>
									<ConversationPanel />
									<TextArea />
								</div>
						</div>
				 </div>
				 }

			</main>
		)
}
