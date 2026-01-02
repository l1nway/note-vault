import './App.css'

import {useState, createRef, useRef} from 'react'
import {Routes, Route, useLocation} from 'react-router'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import Cookies from 'js-cookie'

import Navigation from './navigation'
import Login from './login'

import {apiStore, appStore, pendingStore} from './store'
import useOfflineSync from './components/useOfflineSync'

function App() {

  const {offlineActions} = appStore()
  const {pendings} = pendingStore()

  const token = [
      localStorage.getItem('token'),
      Cookies.get('token')
  ].find(
          token => token
      &&
          token !== 'null'
  )

  useOfflineSync(token)

  // window.addEventListener('online', () => apiStore.getState().setOnline(true))
  // window.addEventListener('offline', () => apiStore.getState().setOnline(false))

  // тестирую возможность менять расположение бара
  const [topBar, setTopBar] = useState(true)

  // 
  const location = useLocation()
  
  const nodeRefs = useRef({})

  const locationKey = location.pathname

  if (!nodeRefs.current[locationKey]) {
      nodeRefs.current[locationKey] = createRef()
  }

  const nodeRef = nodeRefs.current[locationKey]
  
  const topLevel = ['/login', '/register'].includes(location.pathname)
    ? location.pathname
    : 'main'

  console.log('offline actions', offlineActions)
  console.log('pendings', pendings)

  // — Vite
  // — Zustand
  // — js-cookie
  // — React Router
  // — Font Awesome
  // — react-i18next
  // — OverlayScrollbars
  // — React Hotkeys Hook
  // — react-color-palette
  // — use-gesture by pmndrs
  // — React Transition Group
  // — Markdown Editor by uiwjs
  // — React Avatar Editor by mosch 
  // — React Content Loader by danilowoz
  
  return (
    <div
      className='app-main'
      style={{
        '--direction': topBar ? 'column' : 'column-reverse',
        '--justify': topBar ? 'flex-start' : 'space-between'
      }}
    >
      {/* <button
        onClick={() => setTopBar(!topBar)}
        style={{position: 'absolute', zIndex: '12'}}
      >
        top or bottom
      </button> */}
      <TransitionGroup
        component={null}
      >
        <CSSTransition
            key={topLevel}
            nodeRef={nodeRef}
            classNames='nav-change'
            timeout={300}
        >
          <div
            ref={nodeRef}
            className='page-list'
          >
            <Routes
              location={location}
            >
              <Route path='/login' element={<Login/>}/>
              <Route path='/register' element={<Login/>}/>
              <Route path='/*' element={<Navigation/>}/>
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  )
}

export default App