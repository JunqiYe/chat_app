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
import { userLogin} from '../state/userSlice'
import { RootState } from '../state/store';
import { TextDatav2, addNewMessage } from '../state/messagesSlice';

import { Amplify } from 'aws-amplify';
import config from '../amplifyconfiguration.json';
Amplify.configure(config);

import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

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
import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";


// ==========COMPONENTS============
interface MainPageProps {
  signOut?: UseAuthenticator["signOut"]; //() => void;
  user?: AuthUser;
};
function MainPage({ signOut, user }: MainPageProps) {
	// redux store
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


	useEffect(() => {
		// update the state for userid and information
		dispatch(
			userLogin([user!.userId, user!.username])
		)
		// init the Message handler after login is successful
		var socket = new WebSocket(WS_URL)
		var storage = new ChatStorage()
		handler = new MessageHandler(userID, socket, storage);
		handler.websocket.onmessage = (e: MessageEvent) => { handler.clientReceiveMessage(e, newMessageCallback)}
	},[user])

		return (
			<main className="flex h-screen w-screen items-center justify-center p-0 md:p-16">
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
			</main>
		)
}

export default withAuthenticator(MainPage);
