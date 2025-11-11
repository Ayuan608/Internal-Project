import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './services/i18n.js'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast"
import store from './redux/store.js'
import { Provider } from "react-redux"
import { I18nextProvider } from 'react-i18next'
import i18n from './services/i18n.js'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <Provider store={store}>
          <App />
          <Toaster />
        </Provider>
      </BrowserRouter>
    </I18nextProvider>
  </StrictMode>,
)
