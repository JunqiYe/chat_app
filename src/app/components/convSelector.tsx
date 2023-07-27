import { useState } from "react";
import RecipientUserTitle from "./recipientInput";

interface ConvIDBoxProps {
    key: string;
    convID: string;
}
function ConvIDBox({convID}: ConvIDBoxProps) {
    return (
        <div className=" bg-sky-500 hover:bg-sky-700" onClick={()=>{console.log(convID)}}>
            {convID.split('-')[1]}
        </div>
    )
}

interface ConvSelectorProps {
    convIDs: string[]
    // setConvIDs: (convID: string) => void
}
function ConvSelector({convIDs}: ConvSelectorProps) {

    return (
        <div>
            {convIDs.map((id: string) => (
                <ConvIDBox key={id} convID={id}/>
            ))}
        </div>
    )
}


export default function Conversations() {
    const [allConvID, setAllConvID] = useState<string[]>([])

    return (
        <div className=" basis-1/3">
            <RecipientUserTitle convIDs={allConvID} setConvIDs={setAllConvID}/>
            <ConvSelector convIDs={allConvID} />
        </div>
    )
}
