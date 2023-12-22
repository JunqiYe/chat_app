import { PayloadAction, createSlice, current} from "@reduxjs/toolkit";
import { TextData } from "./lib/storage/text_data";

export interface ConversationInfo {
    convID: string,
    convName: string,
    recipients: [string]
}
type convStateSlice = {
    convsations: ConversationInfo[]
    currentConv: ConversationInfo | null
}

const initialState : convStateSlice = {
    convsations: [],
    currentConv: null,
}

const convSlice = createSlice({
    name: "convState",
    initialState,
    reducers:{
        updateConvList: (state, action: PayloadAction<ConversationInfo[]>) => {
            state.convsations = action.payload
        },
        addNewConvs: (state, action: PayloadAction<ConversationInfo[]>) => {
            state.convsations = state.convsations.concat(action.payload)
        },
        addNewConv: (state, action: PayloadAction<ConversationInfo>) => {
            state.convsations.push(action.payload)
        },
        changeConv: (state, action: PayloadAction<string>) => {
            var convIDLookUp = action.payload
            const foundObject = state.convsations.find((obj) => obj.convID == convIDLookUp)
            if (foundObject) {
                state.currentConv = foundObject
            } else {
                state.currentConv = null
            }
            console.log("[convSlice] convIDLookUp: " + convIDLookUp)
            console.log("[convSlice] foundObject: " + foundObject)
        }
    }
})

export const {updateConvList, addNewConvs, addNewConv, changeConv} = convSlice.actions
export default convSlice.reducer
