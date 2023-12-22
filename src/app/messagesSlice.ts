import { PayloadAction, createSlice} from "@reduxjs/toolkit";
import { TextData } from "./lib/storage/text_data";

type messageHistoryState = {
    history: TextData[]
}

const initialState : messageHistoryState = {
    history: []
}

const messageHistorySlice = createSlice({
    name: "messageHistory",
    initialState,
    reducers:{
        addNewMessage: (state, action: PayloadAction<TextData>) => {
            let msg = action.payload
            state.history.push(msg)
            // if (state.history.has(msg.convID)) {
            //     state.history.get(msg.convID)!.push(msg)
            // } else {
            //     state.history.set(msg.convID, [msg]);
            // }
        },
    }
})

export default messageHistorySlice.reducer
