import { useContext, useEffect, useState } from "react";
import RecipientUserTitle from "./recipientInput";
import { mainAppContext } from "./context";
import { SERVER_ADDRESS, SERVER_PORT, handler } from "../page";
import { TextData } from "../lib/storage/text_data";

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
                console.log("[ConvIDBox]: " + recipient.recipient)
                ctx.setConvID(recipient.conversation)
                handler.currentConvID = recipient.conversation
                ctx.setRecipientID(recipient.recipient)
                handler.currentRecipientID = recipient.recipient

                if (!ctx.prevMsg.has(recipient.conversation)) {

                    // call chatHistory API to get the history for this conversation
                    fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/chatHist?" +
                    new URLSearchParams({convID: recipient.conversation}),
                    {
                        method: "GET",
                        // mode:"cors",
                        cache: "no-cache",
                        headers:{
                        // "Content-Type": "application/json",
                        },
                        // body: JSON.stringify(data)
                    })
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        // update context, handler, and react states
                        var hist :TextData[] = []

                        data.msgs.forEach(function(msg:any) {
                            var msg_obj = new TextData(msg.senderID, msg.recipientID, msg.convID, 0, msg.msgData, false, msg.timestamp)
                            hist.push(msg_obj)

                        })

                        console.log("[ConvIDBox]: history rst", hist)
                        console.log("[ConvIDBox]: " + ctx.prevMsg.size)

                        ctx.setPrevMsg(
                            new Map(ctx.prevMsg.set(recipient.conversation, hist))
                        )
                    })
                    .catch(function(err) {
                        console.log(err)
                    })
                }
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
        <div id="selector" className="overflow-y-scroll no-scrollbar rounded-bl-lg">
            {convIDs.map((rec: Recipients) => (
                <div id = {rec.recipient} key={rec.conversation}>
                    <ConvIDBox key={rec.conversation} recipient={rec}/>
                </div>
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
    const ctx = useContext(mainAppContext)
    useEffect(() => {

        fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/convID?userID=" + ctx.userID)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log("received data ",data)

                var another = data.ConvIDs.map((obj: { ConvID: string; RecipientID: string; }) => {
                    var temp : Recipients = {
                        conversation : obj.ConvID,
                        recipient : obj.RecipientID
                    }

                    return temp
                })

                setAllConvID(another)
            })
            .catch(function(err) {
                console.log(err)
            })
    }, [ctx.userID])

    return (
        <div id="left_column" className="flex flex-col w-3/12 bg-slate-800 rounded-l-lg border-r-2 border-gray-600">
            <RecipientUserTitle convIDs={allConvID} setConvIDs={setAllConvID}/>
            <ConvSelector convIDs={allConvID} />
        </div>
    )
}
