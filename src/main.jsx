import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast"
import store from './redux/store.js'
import { Provider } from "react-redux"
import { TextSizeProvider } from './Context/TextContext.jsx'
import { registerLicense } from '@syncfusion/ej2-base'


registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1JFaF1cXGFCf0x3RXxbf1x2ZFdMZV9bRn5PMyBoS35Rc0RhWH5ecnFWRWRYWUJyVEFc"
)
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