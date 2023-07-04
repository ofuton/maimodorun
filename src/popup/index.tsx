import ReactDOM from 'react-dom/client'
import React from 'react'
import './index.css'
import '../i18n/config.ts'
import { App } from './component/App.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
