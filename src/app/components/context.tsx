import { createContext, useContext } from "react";
import { TextData } from "../lib/storage/text_data";


export const userIDContext = createContext({
    signedIn: false,
    setSignIn: (n: any) => {},
    userID:"",
    setUserID: (n: any) => {},
    recipientID:"",
    setRecipientID: (n: any) => {},
    convID:"",
    setConvID: (n: any) => {}
})

export const prevMsgContext = createContext<any>({
    prevMsg: [],
    setPrevMsg: (n: any) => {},
})

// export function useUserIDContext() {
//     return useContext(userIDContext)
// }

// export function usePrevMsgContext() {
//     if (prevMsgContext.) {

//     return useContext(prevMsgContext)
// }
