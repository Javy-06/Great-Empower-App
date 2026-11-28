import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PhonePreview } from './PhonePreview'
import { isEmbedded, readDemoMode, startDemoSession } from './demo/demoSession'
import { DemoApp } from './demo/DemoApp'
import './index.css'

// Demo System (`?demo`): the entry, the App Demo (`?demo=app`) and the Presentation (`?demo=present`).
// Each runs in its own isolated demo namespace; see src/demo/demoSession.ts.
const DemoEntry = lazy(() => import('./demo/DemoEntry').then((m) => ({ default: m.DemoEntry })))
const PresentationDemo = lazy(() => import('./demo/presentation/PresentationDemo').then((m) => ({ default: m.PresentationDemo })))

// `?preview=phone` shows the app inside an optional phone frame for desktop review only.
const phonePreview = new URLSearchParams(window.location.search).get('preview') === 'phone'
const demo = readDemoMode()
// The opening splash belongs to the app itself; the demo shells (and the phone inside them) skip it.
if (phonePreview || demo === 'entry' || demo === 'present' || (demo === 'app' && isEmbedded())) document.getElementById('ge-boot')?.remove()
// The App Demo opens its sample profile before anything renders.
if (demo === 'app') startDemoSession()

const root =
  demo === 'entry' ? <DemoEntry />
  : demo === 'present' ? <PresentationDemo />
  : demo === 'app' ? <DemoApp />
  : phonePreview ? <PhonePreview />
  : <App />

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={null}>{root}</Suspense>
  </React.StrictMode>,
)
