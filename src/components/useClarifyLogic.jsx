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
        // saving a user's action in case it needs to be repeated
        setRetryFunction,
        currentElementId
    } = clarifyStore()

    const {online, offlineMode, addOfflineActions, setNotes, setCategories, setTags, setIsSyncing, setTrash, setArchive} = appStore()

    // used to determine the need for a redirect; on the page of a specific note after deleting
    const renavigate = location.pathname == `/notes/note/${props.id}`

    // removes slash at the beginning
    const pathSegments = location.pathname.slice(1).split('/')

    // converting the address notes/note/${id} to notes — suitable for the server
    const path = (pathSegments[0] == 'notes' && pathSegments[1] == 'note')
        ? 'notes'
        : pathSegments[0]

    // small filter that identifies the desired data object from storage according to the selected action and the current page
    const effectivePath = (path == 'archived' || path == 'trash' || path.startsWith('notes/note')) ? 'notes' : path
    
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
        if (action == 'new') {
            setClarifyLoading(false)
            return
        }
        fetch(`http://api.notevault.pro/api/v1/${(path == 'archived' || path == 'trash') ? 'notes' : path}`,
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
            if (action == 'edit') {
                props.setName(resData.find(item => item.id == props.id)?.name || '')
                props.setColor(resData.find(item => item.color == props.color)?.color || '')
            }
        })
    }

    // to get at the first render
    useEffect(() => online ? get() : setClarifyLoading(false), [])

    // determining which server request must be re-executed to update the list after the user's action
    const refresh = {
        notes: props.getNotes,
        tags: props.getGroups,
        categories: props.getGroups,
        archived: props.getTrash,
        trash: props.getTrash,
    }

    // sending action results to the server (create new, edit existing, archive or delete)
    const change = async (retryContext = null) => {
        const currentId = retryContext?.id || props.id
        const currentAction = retryContext?.action || action
        const currentPath = retryContext?.path || path
        const currentName = retryContext?.name || props.name
        const currentColor = retryContext?.color || props.color

        const payload = ['new', 'edit'].includes(currentAction)
            ? currentPath == 'categories'
                ? {name: currentName, color: currentColor}
                : {name: currentName}
            : null

        const setterMap = {
            categories: setCategories,
            notes: setNotes,
            tags: setTags,
            trash: setTrash,
            archived: setArchive
        }

        const setter = setterMap[currentPath]

        const updateItem = (patch) =>
            setter(prev =>
                prev.map(item =>
                    item.id == currentId ? {...item, ...patch} : item
            ))

        const isActive = currentAction == 'new' || currentId == currentElementId
        let requestError = false
        try {
            await clarifyApi({entity: currentPath, action: currentAction, id: currentId, token, payload})

            if (currentAction == 'edit') {
                updateItem({
                    name: currentName,
                    color: currentColor,
                    saving: false,
                    error: false
                })
            } else {
                setter(prev => prev.filter(item => item.id !== currentId))
            }

            if (renavigate) navigate('/notes')

            if (!visibility && action !== false && isActive) closeAnim()
        } catch (error) {
            requestError = true
            updateItem({
                name: currentName,
                color: currentColor,
                saving: false,
                error: true
            })
    } finally {
        updateItem({
            name: currentName,
            color: currentColor,
            saving: false,
            error: requestError,
            syncing: false
        })

        props.setName('')
        props.setColor('')

        if (currentPath == 'archived' || currentPath == 'trash') {
            setNotes(prev => prev.map(item =>
                item.id == currentId ? {
                    ...item,
                    saving: false,
                    error: false,
                    syncing: false
                } : item
            ))
        }
    }}

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
            archive: setArchive
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
                            ? {...item,
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

            setter(prev =>
                prev.map(item =>
                    item.id == props.id
                        ? {...item,
                            name: props.name,
                            color: props.color,
                            saving: true
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
                setter(prev => ([{
                    name: props.name,
                    color: props.color,
                    notes_count: 0,
                    id: tempId,
                    tempId,
                    offline: true,
                    syncing: false,
                    syncAction: 'create',
                    created_at: new Date().toISOString()
                },
                    ...prev
                ]))
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

            setter(prev => ([{
                    name: props.name,
                    color: props.color,
                    notes_count: 0
                },
                    ...prev
                ]))
            change({id: props.id, action, name: props.name, color: props.color, path})
            closeAnim()
        } else if (action == 'unarchive' || action == 'restore') {
            if (!online || offlineMode) {
                let restoredItem = null

                const setter = action == 'restore' ? setTrash : setArchive
                setter(prev => {
                    const updated = prev.filter(item => {
                        if (item.id == props.id) {
                            restoredItem = {
                                ...item,
                                offline: true,
                                syncing: false,
                                syncAction: action
                            }
                            return false
                        }
                            return true
                        })
                            return updated
                    })

                    if (restoredItem) {
                        setNotes(prev => [restoredItem, ...prev])
                    }

                    addOfflineActions({
                        type: action,
                        entity: path,
                        payload: {id: props.id}
                    })

                    setIsSyncing(false)
                    closeAnim()
                    return
        }
            let restoredItem = null

            const setter = action == 'restore' ? setTrash : setArchive
                setter(prev => {
                    const updated = prev.filter(item => {
                        if (item.id == props.id) {
                            restoredItem = {...item, syncing: true}
                            return false
                        }
                        return true
                    })
                return updated
            })

            if (restoredItem) {
                setNotes(prev => [restoredItem, ...prev])
            }

            change({id: props.id})
            closeAnim()
        } else {
            const currentId = retryContext?.id || props.id

            if (!online || offlineMode) {
                addOfflineActions({
                    type: action,
                    entity: path,
                    payload: {id: currentId}
                })
                setIsSyncing(false)
            } else {
                change(retryContext || {id: currentId, action, path})
            }

            if (setter) {
                setter(prev => prev.filter(item => item.id != currentId))
            }
            
            closeAnim()
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
            setClarifyLoading
        },
        pathData: {
            effectivePath,
            path
        }
    }
}

export default useClarifyLogic