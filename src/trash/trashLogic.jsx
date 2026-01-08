import {useState, useEffect, useRef, useMemo} from 'react'
import {useLocation} from 'react-router'
import Cookies from 'js-cookie'

import {clarifyStore, apiStore, appStore} from '../store'
import getTrash from './getTrash'

function trashLogic() {
  const online = apiStore(state => state.online)
  
  const token = useMemo(() => [localStorage.getItem('token'), Cookies.get('token')].find(t => t && t !== 'null'), [])

  const {trash, archive} = appStore()

  // used to determine whether the component will perform the login or registration function
  const location = useLocation()
  const path = useMemo(
    () => location.pathname.slice(1),
  [location.pathname])

  const {
    // action being performed and its purpose
    setAction,
    // <Clarify/> window visibility
    setVisibility,
    // animation status (used to block unwanted player actions during an animation that could break the animation)
    animating, setAnimating,
    setErrorAction
  } = clarifyStore()

  const [deletedLoading, setDeletedLoading] = useState(false)
  const [archivedLoading, setArchivedLoading] = useState(false)

  // triggers the function execution on the first load
  useEffect(() => {if (online) {
    if (path == 'trash') { 
      trash?.length == 0 && setDeletedLoading(true)
    } else 
      archive?.length == 0 && setArchivedLoading(true)
      token && getTrash(path, setDeletedLoading, setArchivedLoading)
  }}, [])

  useEffect(() => {
    if (Cookies.get('offline') != 'true' && !online) {
      alert('нет инета и оффлайн режима')
      path == 'trash' ? setDeletedLoading (false) : setArchivedLoading(false)
    } else {
      path == 'trash' ? setDeletedLoading (false) : setArchivedLoading(false)
    }
  }, [online])

  // refs for correctly setting focus on the checkbox imitation
  const gridRef = useRef(null)
  const listRef = useRef(null)

  const [catsView, setCatsView] = useState('grid')
  const listView = catsView == 'list'

  // пока что не используется
  const [selectedNotes, setSelectedNotes] = useState([])

  const selectNote = (note) => {
    setSelectedNotes(prev =>
      prev.includes(note)
        // add
        ? prev.filter(i => i !== note)
        // remove
        : [...prev, note]
    )
  }

  const [elementID, setElementID] = useState('')
  // 

  const openAnim = (action) => {
    if (animating == true) {
        return false
    }
    setAnimating(true)
    setAction(action)
    setErrorAction(action)

    setTimeout(() => {
        setVisibility(true)
    }, 10)

    setTimeout(() => {
        setAnimating(false)
    }, 300)
    }

    return {deletedLoading, archivedLoading, path, selectedNotes, catsView, listView, elementID, gridRef, listRef, getTrash, setCatsView, selectNote, setElementID, openAnim}
}

export default trashLogic