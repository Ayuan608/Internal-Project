import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast"
import store from './redux/store.js'
import { Provider } from "react-redux"
import { TextSizeProvider } from './Context/TextContext.jsx'

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <BrowserRouter>
          <TextSizeProvider>
            <App />
            <Toaster position="top-right" reverseOrder={false} />
          </TextSizeProvider>
      </BrowserRouter>
    </Provider>
)