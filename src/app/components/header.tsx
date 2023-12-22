import { mainAppContext } from "./context"

export default function HeaderBar() {
    return (
        <div id="app header" className="flex h-[7%] w-full items-center justify-between p-4 sm:pt-4 font-mono text-sm lg:flex">
            <p>Chat App 💬</p>
            <mainAppContext.Consumer>
                {(value) =>
                    <p>{value.userID}</p>
                }
            </mainAppContext.Consumer>
        </div>
    )
  }
