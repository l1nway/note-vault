import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import './i18n'

import App from './App.jsx'

const queryClient = new QueryClient()

if (
  'serviceWorker' in navigator
  // import.meta.env.PROD
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration)
      })
      .catch(error => {
        console.error('SW registration failed:', error)
      })
  })
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider
      client={queryClient}
    >
      <App/>
    </QueryClientProvider>
  </BrowserRouter>
)