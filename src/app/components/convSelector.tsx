import { useContext, useState } from "react";
import RecipientUserTitle from "./recipientInput";
import { mainAppContext } from "./context";
import { handler } from "../page";

export interface Recipients {
    recipient: string;
    conversation: string;
}

interface ConvIDBoxProps {
    key: string;
    recipient: Recipients;
}
function ConvIDBox({recipient}: ConvIDBoxProps) {
    const ctx = useContext(mainAppContext);
    return (
        <div className="flex h-8 border-black items-center pl-3 bg-sky-500 hover:bg-sky-700"
            onClick={()=>{
                ctx.setConvID(recipient.conversation)
                handler.currentConvID = recipient.conversation
                ctx.setRecipientID(recipient.recipient)
                handler.currentRecipientID = recipient.recipient
                // console.log(convID)
            }}>

            {recipient.recipient}
        </div>
    )
}

interface ConvSelectorProps {
    convIDs: Recipients[]
    // setConvIDs: (convID: string) => void
}
function ConvSelector({convIDs}: ConvSelectorProps) {

    return (
        <div className="overflow-y-scroll rounded-bl-lg">
            {convIDs.map((rec: Recipients) => (
                <ConvIDBox key={rec.conversation} recipient={rec}/>
            ))}
        </div>
    )
}


export default function ConversationsSelect() {
    // var temp1: Recipients = {
    //     recipient: "test1",
    //     conversation: "test1"
    //   }
    // var temp2: Recipients = {
    // recipient: "test2",
    // conversation: "asdf"
    // }
    // const [allConvID, setAllConvID] = useState<Recipients[]>([temp1, temp2])
    const [allConvID, setAllConvID] = useState<Recipients[]>([])

    return (
        <div id="left column" className="flex flex-col w-3/12 bg-slate-800 rounded-l-lg border-r-2 border-gray-600">
            <RecipientUserTitle convIDs={allConvID} setConvIDs={setAllConvID}/>
            <ConvSelector convIDs={allConvID} />
        </div>
    )
}
