import { useContext, useEffect, useState } from "react";
import RecipientUserTitle from "./recipientInput";
import { SERVER_ADDRESS, SERVER_PORT, handler } from "./MainPage";
import { TextData } from "../lib/storage/text_data";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { ConversationInfo, changeConv, updateConvList } from "../state/convSlice";
import { TextDatav2, addNewMessage, newMessageHist } from "../state/messagesSlice";

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
            }}>
            {convInfo.convName}
        </div>
    )
}

// component for showing the list of conv that user is part of
// each list has a ConvIDBox component that allows the user to click to select
function ConversationList() {
    const convInfos = useSelector((state: RootState) => state.convState.convsations)
    const userID = useSelector((state: RootState) => state.userState.currentUserID)
    const dispatch = useDispatch()
    
    // side effect for retrieving list of conversation that the user is part of
    useEffect(() => {
        // fetch api for ConvID api
        fetch("http://" + SERVER_ADDRESS + SERVER_PORT + "/api/convID?userID=" + userID)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log("received data ", data)

            var conversations = data.ConvIDs.map((obj: { ConversationID: string; ConvName: string; SenderID: string; RecipientID: string }) => {
                return {
                    convID : obj.ConversationID,
                    convName: obj.ConvName,
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
    }, [dispatch, userID])

    return (
        <div id="selector" className="overflow-y-scroll no-scrollbar rounded-bl-lg">
            {convInfos.map((conv: ConversationInfo) => (
                <div id = {conv.convName} key={conv.convName}>
                    <ConvIDBox key={conv.convID} convInfo={conv}/>
                </div>
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
