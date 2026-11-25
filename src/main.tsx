import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PhonePreview } from './PhonePreview'
import './index.css'

// `?preview=phone` shows the app inside an optional phone frame for desktop review only.
const phonePreview = new URLSearchParams(window.location.search).get('preview') === 'phone'
if (phonePreview) document.getElementById('ge-boot')?.remove()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{phonePreview ? <PhonePreview /> : <App />}</React.StrictMode>,
)
