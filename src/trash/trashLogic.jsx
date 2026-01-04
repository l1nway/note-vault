import {useState, useEffect, useRef, useMemo} from 'react'
import {useLocation} from 'react-router'
import Cookies from 'js-cookie'

import {clarifyStore, appStore, apiStore} from '../store'

function trashLogic() {
    const online = apiStore(state => state.online)

  // used to determine whether the component will perform the login or registration function
    const location = useLocation()
    const path = useMemo(
        () => location.pathname.slice(1),
    [location.pathname])

    const {
      // action being performed and its purpose
      setAction,
      // error text returned by the server
      // <Clarify/> window visibility
      setVisibility,
      // animation status (used to block unwanted player actions during an animation that could break the animation)
      animating,
      setAnimating,
      // status and it change of data download from the server in the <Clarify/> window
      // status of the moment of saving information
      setErrorAction
    } = clarifyStore()

  const {setArchive, setTrash, setOfflineMode} = appStore()

  const [deletedLoading, setDeletedLoading] = useState(false)
  const [archivedLoading, setArchivedLoading] = useState(false)

  // 
  const token = [
      localStorage.getItem('token'),
      Cookies.get('token')
  ].find(
      token => token
  &&
      token !== 'null'
  )

  const trashUrl = useMemo(
      () => `http://api.notevault.pro/api/v1/notes?${path == 'trash' ? 'deleted' : path}=true`,
  [path])

  const getTrash = () => {
    path == 'trash' ? setDeletedLoading (true) : setArchivedLoading(true)
    fetch(trashUrl, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            authorization: 
                `Bearer ${token}`
        }
      })
    .then(res => res.json())
    .then(resData => {
      if (path == 'trash') {
        setTrash(resData.data)
        setDeletedLoading (false)
      } else
        setArchive(resData.data)
        setArchivedLoading(false)
    })
  }

  // triggers the function execution on the first load
  useEffect(() => {if (online) {getTrash()}}, [])

  useEffect(() => {
      if (online) {
          setOfflineMode(false)
      }
      
      if (!online) {
          setOfflineMode(true)
      }
  }, [online])

  // refs for correctly setting focus on the checkbox imitation
  const gridRef = useRef(null)
  const listRef = useRef(null)

  const [catsView, setCatsView] = useState('grid')
  const listView = catsView == 'list'

  // 
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

  // array with all tags

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