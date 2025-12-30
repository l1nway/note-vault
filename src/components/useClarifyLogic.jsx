import {useEffect} from 'react'
import {useLocation, useNavigate} from 'react-router'
import Cookies from 'js-cookie'
import {clarifyStore, appStore} from '../store'

import clarifyApi from './clarifyApi'

const useClarifyLogic = (props) => {

    const navigate = useNavigate()

    // state of the current pathname is needed to determine what information to display in the window
    const location = useLocation()

    // getting a user token from local storage or cookies
    const token = [
            localStorage.getItem('token'),
            Cookies.get('token')
        ].find(
                token => token
            &&
                token !== 'null'
        )
    
    // getting all actions and states
    const {
        // user actions; false unmounts the component
        action, setAction,
        // error or success status of the first notes load
        loadingError, setLoadingError,
        // clarify window visibility state when it is mounted
        visibility, setVisibility,
        // clarify window animation state
        animating, setAnimating,
        // clarify window loading state
        clarifyLoading, setClarifyLoading,
        // notes saving state
        setSavings,
        // saving and deleting errors that occurred when saving data
        setSavingErrors, removeSavingError,
        // saving a user's action in case it needs to be repeated
        setRetryFunction,
        currentElementId
    } = clarifyStore()

    const {online, offlineMode, addOfflineActions, setNotes, setCategories, setTags, setIsSyncing, setTrash, notes} = appStore()

    // used to determine the need for a redirect; on the page of a specific note after deleting
    const renavigate = location.pathname == `/notes/note/${props.id}`

    // removes slash at the beginning
    const pathSegments = location.pathname.slice(1).split('/')

    // converting the address notes/note/${id} to notes — suitable for the server
    const path = (pathSegments[0] == 'notes' && pathSegments[1] == 'note')
    ? 'notes'
    : pathSegments[0]

    // small filter that identifies the desired data object from storage according to the selected action and the current page
    const effectivePath = (path == 'archive' || path == 'trash' || path.startsWith('notes/note')) ? 'notes' : path
    
    // disappearing clarify window with animation and unmounting
    const closeAnim = () => {
        if (animating == true) {
            return false
        }
        setVisibility(false)
        setAnimating(true)
        setTimeout(() =>
            setAction(false), 350
        )
        setTimeout(() => {
            setAnimating(false)
        }, 300)
    }

    // getting information (to fill inputs in the edit action)
    const get = () => {
        fetch(`http://api.notevault.pro/api/v1/${(path == 'archive' || path == 'trash') ? 'notes' : path}`,
            {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    authorization: 
                        `Bearer ${token}`
                }
            })
        .then(res => {
            if (!res.ok) {
                setLoadingError(true)
                setClarifyLoading(false)
                !visibility && closeAnim()
                return Promise.reject('')
            }
            return res.status == 204 || res.status == 404 ? {} : res.json()
        })
        .then(resData => {
            setClarifyLoading(false)
            // props.setName(resData.find(item => item.id == props.id)?.name || '')
            // props.setColor(resData.find(item => item.color == props.color)?.color || '')
        })
    }

    // to get at the first render
    useEffect(() => get(), [])

    // determining which server request must be re-executed to update the list after the user's action
    const refresh = {
        notes: props.getNotes,
        tags: props.getGroups,
        categories: props.getGroups,
        archive: props.getTrash,
        trash: props.getTrash,
    }

    // sending action results to the server (create new, edit existing, archive or delete)
    const change = async (retryContext = null) => {
        const currentId = retryContext?.id || props.id
        const currentAction = retryContext?.action || action
        const currentPath = retryContext?.path || path
        const currentName = retryContext?.name || props.name
        const currentColor = retryContext?.color || props.color

        setSavings(prev => ({...prev, [props.id]: true, [path]: true}))

        try {
            const payload = ['new', 'edit'].includes(currentAction)
                ? path == 'categories'
                ? {name: currentName, color: currentColor}
                : {name: currentName}
                : null

            await clarifyApi({
                entity: currentPath,
                action: currentAction,
                id: currentId,
                token,
                payload
            })

            if (renavigate) navigate('/notes')
            // if successful, the data saving icon is removed
            setSavings(prev => ({...prev, [props.id]: false, [path]: false}))

            const activeIdInStore = currentElementId

            if (currentAction == 'new' || currentId == activeIdInStore) {
                if (!visibility && action !== false) {
                    closeAnim()
                }
            }

            try {
                setSavings(prev => ({...prev, [currentId]: false}))
                removeSavingError(currentId, path)

                // if Clarify was mounted only to try to download data from the server again after error, then it is unmounted back
                const activeIdInStore = currentElementId
                    if (currentAction == 'new' || currentId == activeIdInStore) {
                        if (!visibility && action !== false) closeAnim()
                    }

                if (currentAction == 'delete') {
                    setTrash(prev =>
                        prev.map(item =>
                            item.id == currentId
                                ? {...item, syncing: false}
                                : item
                        )
                    )
                }
            } catch (error) {
                console.error('', error)
            }

        } catch (error) {
            setSavings(prev => ({...prev, [props.id]: false, [path]: false}))
            setSavingErrors(prev => ({
                ...prev,
                [path]: {
                    ...(prev[path] || {}),
                    [currentId]: {
                        action: currentAction,
                        name: currentName,
                        color: currentColor,
                        path: path
                    }
                }
            }))
            
            if (path == 'tags') props.getGroups()
            else if (path == 'categories') props.getGroups()
            else props.getNotes()
            
            if (!visibility && action != false) closeAnim()
        }
    }

    // saving in the interface, so-called optimistic update
    const offlineChange = (retryContext = null) => {
        setRetryFunction(action)

        const currentAction = retryContext?.action || action
        const currentId = retryContext?.id || props.id
        const currentPath = retryContext?.path || path

        // storage of server requests for list updates for each page
        const setterMap = {
            categories: setCategories,
            notes: setNotes,
            tags: setTags,
            trash: setTrash,
            archive: setTrash
        }

        // matching by path
        const setter = setterMap[path]
            
        if (action == 'edit') {
            if (!online || offlineMode) {
                const tempId = Date.now()
                // sync and offline flags for UI, syncAction -- for offline synchronization
                setter(prev =>
                prev.map(item =>
                    item.id == props.id
                        ? { ...item,
                            name: props.name,
                            color: props.color,
                            tempId,
                            offline: true,
                            syncing: false,
                            syncAction: 'edit'
                        }
                        : item
                    )
                )
                // adding a queue to offline synchronization
                addOfflineActions({
                    type: 'edit',
                    entity: path,
                    payload: {
                        tempId,
                        name: props.name,
                        color: props.color,
                        id: props.id
                    }
                })
                // flag is set that synchronization does not occur
                setIsSyncing(false)
                closeAnim()
                return
            }
            setSavings(prev => ({...prev, [props.id]: true}))

            setter(prev =>
                prev.map(item =>
                    item.id == props.id
                        ? { ...item,
                            name: props.name,
                            color: props.color
                        }
                        : item
                )
            )
            change(retryContext)
            closeAnim()
        } else if (action == 'new') {
            if (!online || offlineMode) {
                const tempId = Date.now()
                // sync and offline flags for UI, syncAction -- for offline synchronization
                setter(prev => {
                    const newGroup = [...prev, {
                        name: props.name,
                        color: props.color,
                        notes_count: 0,
                        id: tempId,
                        tempId,
                        offline: true,
                        syncing: false,
                        syncAction: 'create',
                        created_at: new Date().toISOString()
                    }]
                    return newGroup.sort((a, b) => a.name.localeCompare(b.name))
                })
                // adding a queue to offline synchronization
                addOfflineActions({
                    type: 'create',
                    entity: path,
                    payload: {
                        tempId,
                        name: props.name,
                        color: props.color,
                        notes_count: 0
                    }
                })
                // flag is set that synchronization does not occur
                setIsSyncing(false)
                closeAnim()
                return
            }

            setSavings(prev => ({...prev, [props.id]: true}))

            setter(prev => {
                const newGroup = [...prev, {
                    name: props.name,
                    color: props.color,
                    notes_count: 0
                }]
                return newGroup.sort((a, b) => a.name.localeCompare(b.name))
            })
            change({id: props.id, action, name: props.name, color: props.color, path})
            closeAnim()
        } else if (action == 'unarchive' || action == 'restore') {
            console.log('unarchive logic')
            closeAnim()
        } else {
            // delete, archive, force
            setSavings(prev => ({...prev, [currentId]: true}))

            if (!online || offlineMode) {
                addOfflineActions({
                    type: 'delete',
                    entity: path,
                    payload: {id: props.id}
                })
            }

            if (setter) {
                setter(prev => prev.filter(item => item.id !== currentId))
            }
        }
    }

    return {
        state: {
            clarifyLoading,
            loadingError,
            visibility,
            animating,
            action
        },
        actions: {
            get,
            closeAnim,
            setAction,
            setAnimating,
            offlineChange,
            change,
            setVisibility,
            setLoadingError,
            removeSavingError,
            setClarifyLoading
        },
        pathData: {
            effectivePath,
            path
        }
    }
}

export default useClarifyLogic