'use client'
import React, { useState, useEffect} from 'react';
import {useRouter} from 'next/navigation'
import {userID, updateUserID} from "./../page"

export default function Login() {
    var [username, setUsername] = useState("")
    const router = useRouter()

    function handleUsernameChange(event: any) {
        setUsername(event.target.value)
        // console.log(username)
    }

    useEffect(() => {
        const form = document.querySelector('form')
        if (form == null) {throw new Error("cannot find form element")}

        form.addEventListener('submit', event => {
            // submit event detected
            event.preventDefault()
            updateUserID(username)
            router.push('/')
        })
    })

    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className='p-6 w-5/6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
                    <h1 className='mb-3 space-y-4 md:space-y-6'>Chat App</h1>
                    <form className="space-y-4 md:space-y-6"
                        id='username_form'
                        // onSubmit={handleSignIn}
                        action={"/"}
                        >
                    <div>
                        {/* <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">username</label> */}
                        <input className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Username" name="Username" value={username} onChange={handleUsernameChange}></input>
                    </div>
                    <button className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        type="submit"
                        // onClick={handleSignIn}
                        >Login</button>
                    </form>
                </div>
        </div>
    )
}

