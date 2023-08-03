import { createContext, useContext } from "react";

export const mainAppContext = createContext<any>({
    signedIn: false,
    setSignIn: (n: any) => {},
    userID:"",
    setUserID: (n: any) => {},
    recipientID:"",
    setRecipientID: (n: any) => {},
    convID:"",
    setConvID: (n: any) => {},
    prevMsg: [],
    setPrevMsg: (n: any) => {},
})

export const prevMsgContext = createContext<any>({
    prevMsg: [],
    setPrevMsg: (n: any) => {},
})

// export function usemainAppContext() {
//     return useContext(mainAppContext)
// }

// export function usePrevMsgContext() {
//     if (prevMsgContext.) {

//     return useContext(prevMsgContext)
// }
