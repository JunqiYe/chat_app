'use client'
import React, { useState, useEffect, useContext } from 'react';
import { mainAppContext } from './context';
import { isIDValid } from '../lib/ID_helper';
import { SERVER_ADDRESS, SERVER_PORT } from '../page';

interface loginStatus {
	// onLogin: (status: boolean) => void;
}

export default function Login(props: loginStatus){
	var [input, setInput] = useState("")
	const ctx = useContext(mainAppContext)

	function handleUsernameChange(event: any) {
		setInput(event.target.value)
	}

	function handleSignInSubmit(event: any) {
		event.preventDefault()
		// enforce ID
		if (!isIDValid(input)) {
			alert("Please enter a valid username, use letters, numbers, _ or !")
		} else {
			fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/login", {
				method: "POST",
				credentials: 'include',
				headers:{
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user_id: input,
					password: 'none',
				})
			}).then(response => {
				if (response.status == 200) {
					ctx.setUserID(input)
					ctx.setSignIn(true)

					// localStorage.setItem(token!, input)
				}
			}).catch(error => {
				console.log(error)
			})
		}

		// // clean the entry
		// setInput('')
	}

	useEffect(()=>{

		// console.log("somehing")

	},[])
	return (
		<div className='p-6 w-11/12 sm:max-w-[24rem] rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700'>
			<h1 className='mb-3 space-y-4 md:space-y-6'>Chat App</h1>
			<form className="space-y-4 md:space-y-6"
				id='username_div'
				onSubmit={handleSignInSubmit}
				// action={"/"}
				>
			<div>
				{/* <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">username</label> */}
				<input id="username_input" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="Username" name="Username" value={input} onChange={handleUsernameChange}></input>
			</div>
			<button className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-400 dark:focus:ring-primary-800"
				type="submit"
				onClick={handleSignInSubmit}
				>Login</button>
			</form>
		</div>
	)
}

