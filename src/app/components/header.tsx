// import { mainAppContext } from "../page"
// import { useContext } from "react"
import { mainAppContext } from "./context"

export default function HeaderBar() {
    return (
        <div className="z-10 flex flex-row h-full w-full max-w-md items-center justify-between p-4 font-mono text-sm lg:flex">
            <p>Chat App 💬</p>
            <mainAppContext.Consumer>
                {(value) =>
                    <p>{value.userID}</p>
                }
            </mainAppContext.Consumer>
        </div>
    )
  }
