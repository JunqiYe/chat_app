import { PayloadAction, createSlice} from "@reduxjs/toolkit";
import { TextData } from "./lib/storage/text_data";

export interface TextDatav2 {
    userID: string
    convID: string
    timestamp: number
    msgData: string
    isImg: boolean
}
type messageHistoryState = {
    history: TextDatav2[]
}

const initialState : messageHistoryState = {
    history: []
}

const messageHistorySlice = createSlice({
    name: "messageHistory",
    initialState,
    reducers:{
        addNewMessage: (state, action: PayloadAction<TextDatav2>) => {
            let msg = action.payload
            state.history.unshift(msg)
            // if (state.history.has(msg.convID)) {
            //     state.history.get(msg.convID)!.push(msg)
            // } else {
            //     state.history.set(msg.convID, [msg]);
            // }
        },
        newMessageHist: (state, action: PayloadAction<TextDatav2[]>) => {
            state.history = action.payload
        },
    }
})

export const {addNewMessage, newMessageHist} = messageHistorySlice.actions 
export default messageHistorySlice.reducer
