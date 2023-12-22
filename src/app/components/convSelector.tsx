import { useContext, useEffect, useState } from "react";
import RecipientUserTitle from "./recipientInput";
import { mainAppContext } from "./context";
import { SERVER_ADDRESS, SERVER_PORT, handler } from "./MainPage";
import { TextData } from "../lib/storage/text_data";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { ConversationInfo, changeConv, updateConvList } from "../convSlice";
import { TextDatav2, addNewMessage, newMessageHist } from "../messagesSlice";

export interface Recipients {
    recipient: string;
    conversation: string;
}

// after clicking the ConvIDBox, if the messages are not available, fetch the history from server
interface ConvIDBoxProps {
    key: string;
    convInfo: ConversationInfo;
}
function ConvIDBox({convInfo}: ConvIDBoxProps) {
    const dispatch = useDispatch()
    return (
        <div className="flex h-8 border-black items-center pl-3 bg-sky-500 hover:bg-sky-700"
            onClick={()=>{
                var selectedConversationID = convInfo.convID
                console.log("[ConvIDBox]: selected" + selectedConversationID)

                dispatch(
                    changeConv(selectedConversationID)
                )

                handler.currentConvID = selectedConversationID
                // handler.currentRecipientID = convInfo.recipients[0]
                // ctx.setRecipientID(convInfo.recipients[0])

                // TODO: removed checking for if message history exists, might need to optimize later

                // call chatHistory API to get the history for this conversation
                fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/chatHist?" +
                new URLSearchParams({convID: selectedConversationID}),
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
                    var hist :TextDatav2[] = []

                    data.msgs.forEach(function(msg:any) {
                        var msg_obj = new TextData(msg.senderID, msg.convID, 0, msg.msgData, false, msg.timestamp)
                        // var msg_obj = new TextData(msg.senderID, msg.convID, 0, msg.msgData, false, msg.timestamp)
                        hist.push({
                            userID: msg.senderID,
                            convID: msg.convID,
                            timestamp: msg.timestamp,
                            msgData: msg.msgData,
                            isImg: false,
                        } as TextDatav2)

                    })

                    console.log("[ConvIDBox]: history rst", hist)
                    // console.log("[ConvIDBox]: " + ctx.prevMsg.size)

                    // set the message history state
                    dispatch(
                        newMessageHist(hist)
                    )
                })
                .catch(function(err) {
                    console.log(err)
                })
            }}>

            {convInfo.convID}
        </div>
    )
}

// component for showing the list of conv that user is part of
// each list has a ConvIDBox component that allows the user to click to select
function ConversationList() {
    const convInfos = useSelector((state: RootState) => state.convState.convsations)
    const userID = useSelector((state: RootState) => state.userState.currentUserID)
    const dispatch = useDispatch()
    
    useEffect(() => {

        fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/convID?userID=" + userID)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log("received data ",data)

            var conversations = data.ConvIDs.map((obj: { ConvID: string; RecipientID: string; }) => {
                return {
                    convID : obj.ConvID,
                    convName: "tbd",
                    recipients: [obj.RecipientID]
                }
            })

            dispatch(
                updateConvList(conversations)
            )
        })
        .catch(function(err) {
            console.log(err)
        })
    }, [userID])

    return (
        <div id="selector" className="overflow-y-scroll no-scrollbar rounded-bl-lg">
            {convInfos.map((conv: ConversationInfo) => (
                <ConvIDBox key={conv.convID} convInfo={conv}/>
            ))}
        </div>
    )
}

// Overall component for the left panel 
// might make it foldable in the future
export default function ConversationPanel() {
    return (
        <div id="left_column" className="flex flex-col w-3/12 bg-slate-800 rounded-l-lg border-r-2 border-gray-600">
            <RecipientUserTitle />
            <ConversationList />
        </div>
    )
}
