import { useSelector } from "react-redux"
import { RootState } from "../state/store"

export default function HeaderBar() {
    const userID = useSelector((state: RootState) => state.userState.currentUserID)

    return (
        <div id="app header" className="flex h-[7%] w-full items-center justify-between p-4 sm:pt-4 font-mono text-sm lg:flex">
            <p>Chat App 💬</p>
            <p>{userID}</p>
        </div>
    )
  }
