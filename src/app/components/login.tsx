'use client'
import React, { useState, useEffect, useContext } from 'react';
import { mainAppContext } from './context';

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

        // props.onLogin(true)

        ctx.setUserID(input)
        ctx.setSignIn(true)

    }

    return (
        <div className="flex flex-col w-full h-full items-center justify-center px-6 py-8 mx-auto md:h-full lg:py-0">
                <div className='p-6 w-5/6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
                    <h1 className='mb-3 space-y-4 md:space-y-6'>Chat App</h1>
                    <form className="space-y-4 md:space-y-6"
                        id='username_div'
                        onSubmit={handleSignInSubmit}
                        // action={"/"}
                        >
                    <div>
                        {/* <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">username</label> */}
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Username" name="Username" value={input} onChange={handleUsernameChange}></input>
                    </div>
                    <button className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        type="submit"
                        onClick={handleSignInSubmit}
                        >Login</button>
                    </form>
                </div>
        </div>
    )
}

