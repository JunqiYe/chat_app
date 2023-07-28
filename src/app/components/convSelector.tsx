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
        <div className=" bg-sky-500 hover:bg-sky-700"
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
        <div>
            {convIDs.map((rec: Recipients) => (
                <ConvIDBox key={rec.conversation} recipient={rec}/>
            ))}
        </div>
    )
}


export default function ConversationsSelect() {
    const [allConvID, setAllConvID] = useState<Recipients[]>([])

    return (
        <div className=" basis-1/3">
            <RecipientUserTitle convIDs={allConvID} setConvIDs={setAllConvID}/>
            <ConvSelector convIDs={allConvID} />
        </div>
    )
}
