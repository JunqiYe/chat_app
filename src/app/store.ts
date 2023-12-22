import { configureStore } from '@reduxjs/toolkit'
import messageHistoryReducer from './messagesSlice'
import userStateReducer from './userSlice'
import convStateReducer from './convSlice'
export default configureStore({
  reducer: {
    messageHistory: messageHistoryReducer,
    userState: userStateReducer,
    convState: convStateReducer,
  },
})
