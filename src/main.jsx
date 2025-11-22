import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast"
import store from './redux/store.js'
import { Provider } from "react-redux"
import { I18nextProvider } from 'react-i18next'
import i18n from './services/i18n.js'
import AutoTranslateWrapper from './AutoTranslateWrapper.jsx'
import { TextSizeProvider } from './Context/TextContext.jsx'

createRoot(document.getElementById('root')).render(
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <BrowserRouter>
        <AutoTranslateWrapper>
          <TextSizeProvider>
            <App />
            <Toaster position="top-right" reverseOrder={false} />
          </TextSizeProvider>
        </AutoTranslateWrapper>
      </BrowserRouter>
    </Provider>
  </I18nextProvider>
)