import { configureStore } from '@reduxjs/toolkit'
import messageHistoryReducer from './messagesSlice'
import userStateReducer from './userSlice'
import convStateReducer from './convSlice'
export const store = configureStore({
  reducer: {
    messageHistory: messageHistoryReducer,
    userState: userStateReducer,
    convState: convStateReducer,
  },
  
})

export type RootState = ReturnType<typeof store.getState>
