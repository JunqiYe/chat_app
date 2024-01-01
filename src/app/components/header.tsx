import { useSelector } from "react-redux"
import { RootState } from "../state/store"

import { useAuthenticator } from '@aws-amplify/ui-react';

export default function HeaderBar() {
    const { user, signOut } = useAuthenticator((context) => [context.user]);
    return (
        <div id="app header" className="flex h-[7%] w-full items-center justify-between p-4 sm:pt-4 font-mono text-sm lg:flex">
            <p>Chat App 💬</p>
            {/* <p>{user.username}</p> */}
            <button onClick={signOut}>{user.username}</button>
        </div>
    )
  }
