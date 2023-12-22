'use client'
import { Provider } from 'react-redux'
import store from './store'
import MainPage from './components/MainPage'

// ==========COMPONENTS============
export default function App() {
    return (
      <Provider store={store}>
        <MainPage />
      </Provider>
    )
}
