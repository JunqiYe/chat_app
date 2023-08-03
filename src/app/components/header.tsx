// import { mainAppContext } from "../page"
// import { useContext } from "react"
import { mainAppContext } from "./context"
import {handler} from "./../page"

export default function HeaderBar() {
    return (
        <div id="app header" className="flex basis-1/12 w-full items-center justify-between p-4 sm:pt-4 font-mono text-sm lg:flex">
            <p>Chat App 💬</p>
            <mainAppContext.Consumer>
                {(value) =>
                    <p>{value.userID}</p>
                }
            </mainAppContext.Consumer>
        </div>
    )
  }
