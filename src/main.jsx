import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Eski PWA service worker varsa kaldır (önbellek sorunlarını önler)
const BUILD_VERSION = '2026-05-17-mapillary-js-v10-quality'
console.log(`[Türkiye Kâşifi] build=${BUILD_VERSION}`)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister())
  })
}

if ('caches' in window) {
  caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {})
}

try {
  ['herry-validated-v1', 'herry-validated-v2', 'herry-validated-v3'].forEach((k) => localStorage.removeItem(k))
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')).render(<App />)
