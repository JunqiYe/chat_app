import { PayloadAction, createSlice} from "@reduxjs/toolkit";
import { TextData } from "../lib/storage/text_data";

export type UserStateSlice = {
    loggedIn: boolean,
    currentUserID: string,
    currentUserName: string,
}

const initialState : UserStateSlice = {
    loggedIn: false,
    currentUserID: "",
    currentUserName: ""
}

const userSlice = createSlice({
    name: "userState",
    initialState,
    reducers:{
        userLogin: (state, action: PayloadAction<string[]>) => {
            state.loggedIn = true
            state.currentUserID = action.payload[0]
            state.currentUserName = action.payload[1]
        },
        userSignout: (state, action: PayloadAction<string>) => {
            state.loggedIn = false
            state.currentUserID = ""
            state.currentUserName = ""
        }
    }
})

export const {userLogin, userSignout} = userSlice.actions
export default userSlice.reducer
