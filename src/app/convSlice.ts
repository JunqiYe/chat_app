import { PayloadAction, createSlice} from "@reduxjs/toolkit";
import { TextData } from "./lib/storage/text_data";

type convStateSlice = {
    convID: string | null,
    convName: string | null,
}

const initialState : convStateSlice = {
    convID: null,
    convName: null,
}

const convSlice = createSlice({
    name: "convState",
    initialState,
    reducers:{
        changeConv: (state, action: PayloadAction<string>) => {
            state.convID = action.payload
            state.convName = action.payload
        }
    }
})

export default convSlice.reducer
