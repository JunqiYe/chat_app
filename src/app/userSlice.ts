import { PayloadAction, createSlice} from "@reduxjs/toolkit";
import { TextData } from "./lib/storage/text_data";

export type UserStateSlice = {
    loggedIn: boolean,
    currentUserID: string,
}

const initialState : UserStateSlice = {
    loggedIn: false,
    currentUserID: ""
}

const userSlice = createSlice({
    name: "userState",
    initialState,
    reducers:{
        userLogin: (state, action: PayloadAction<string>) => {
            state.loggedIn = true
            state.currentUserID = action.payload
        },
        userSignout: (state, action: PayloadAction<string>) => {
            state.loggedIn = false
            state.currentUserID = ""
        }
    }
})

export const {userLogin, userSignout} = userSlice.actions
export default userSlice.reducer
