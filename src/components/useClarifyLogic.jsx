import {useEffect, useMemo, useCallback} from 'react'
import {useLocation, useNavigate} from 'react-router'
import {useShallow} from 'zustand/react/shallow'
import Cookies from 'js-cookie'
import {clarifyStore, appStore} from '../store'

import clarifyApi from './clarifyApi'
import getTrash from '../trash/getTrash'
import getNotes from '../notes/getNotes'
import getGroups from '../groups/getGroups'

const useClarifyLogic = (props) => {

    const navigate = useNavigate()

    // state of the current pathname is needed to determine what information to display in the window
    const location = useLocation()

    // getting a user token from local storage or cookies
    const token = useMemo(() => [
            localStorage.getItem('token'),
            Cookies.get('token')
        ].find(
                token => token
            &&
                token !== 'null'
    ), [])
    
    // getting all actions and states
    const {action, setAction, loadingError, setLoadingError, visibility, setVisibility, animating, setAnimating, clarifyLoading, setClarifyLoading, setRetryFunction, currentElementId} = clarifyStore(
    useShallow((state) => ({
        // user actions; false unmounts the component
        action: state.action,
        setAction: state.setAction,
        // error or success status of the first notes load
        loadingError: state.loadingError,
        setLoadingError: state.setLoadingError,
        // clarify window visibility state when it is mounted
        visibility: state.visibility,
        setVisibility: state.setVisibility,
        // clarify window animation state
        animating: state.animating,
        setAnimating: state.setAnimating,
        // clarify window loading state
        clarifyLoading: state.clarifyLoading,
        setClarifyLoading: state.setClarifyLoading,
        // saving a user's action in case it needs to be repeated
        setRetryFunction: state.setRetryFunction,
        currentElementId: state.currentElementId,
    })))

    const {online, offlineMode, addOfflineActions, setNotes, setCategories, setTags, setIsSyncing, setTrash, setArchive} = appStore(
        useShallow((state) => ({
            online: state.online,
            offlineMode: state.offlineMode,
            addOfflineActions: state.addOfflineActions,
            setNotes: state.setNotes,
            setCategories: state.setCategories,
            setTags: state.setTags,
            setIsSyncing: state.setIsSyncing,
            setTrash: state.setTrash,
            setArchive: state.setArchive,
    })))

    // used to determine the need for a redirect; on the page of a specific note after deleting
    const renavigate = useMemo(() => location.pathname == `/notes/note/${props.id}`, [location.pathname, props.id])

    // removes slash at the beginning
    const pathSegments = useMemo(() => location.pathname.slice(1).split('/'), [location.pathname])

    // converting the address notes/note/${id} to notes — suitable for the server
    const path = useMemo(() => (pathSegments[0] == 'notes' && pathSegments[1] == 'note')
        ? 'notes'
        : pathSegments[0]
    , [pathSegments])

    // small filter that identifies the desired data object from storage according to the selected action and the current page
    const effectivePath = useMemo(() => (path == 'archived' || path == 'trash' || path.startsWith('notes/note')) ? 'notes' : path, [path])
    
    // disappearing clarify window with animation and unmounting
    const closeAnim = useCallback(() => {
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
    }, [animating, setAction, setAnimating, setVisibility])

    // getting information (to fill inputs in the edit action)
    const get = useCallback(() => {
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
    }, [action, path, props.id, props.name, props.color, setClarifyLoading, setLoadingError, props.setName, props.setColor, token, closeAnim, visibility])

    // to get at the first render
    useEffect(() => online ? get() : setClarifyLoading(false), [])

    // determining which server request must be re-executed to update the list after the user's action
    const refresh = useMemo(() => ({
        notes: getNotes,
        tags: () => getGroups('tags'),
        categories: () => getGroups('categories'),
        archived: () => getTrash('archived'),
        trash: () => getTrash('trash')
    }), [])

    // sending action results to the server (create new, edit existing, archive or delete)
    const change = useCallback(async (retryContext = null) => {
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

        if (requestError) return
        switch (action) {
            case 'delete':
                refresh.trash
                break
            case 'archive':
                refresh.archived
                break
            case 'restore':
            case 'unarchive':
                refresh.notes()
                break
        }

        refresh[path]?.()

        props?.setName?.('')
        props?.setColor?.('')

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
    }}, [action, path, props.id, props.name, props.color, renavigate, visibility, currentElementId, setCategories, setNotes, setTags, setTrash, setArchive, addOfflineActions, setIsSyncing, closeAnim, refresh, navigate])

    // saving in the interface, so-called optimistic update
    const offlineChange = useCallback((retryContext = null) => {
        setRetryFunction(action)

        // storage of server requests for list updates for each page
        const setterMap = {
            categories: setCategories,
            notes: setNotes,
            tags: setTags,
            trash: setTrash,
            archived: setArchive
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
    }, [action, path, props.id, props.name, props.color, addOfflineActions, offlineMode, online, setIsSyncing, setCategories, setNotes, setTags, setTrash, setArchive, closeAnim, change])

    return useMemo(() => ({
        state: {clarifyLoading, loadingError, visibility, animating, action},
        actions: {get, closeAnim, setAction, setAnimating, offlineChange, change, setVisibility, setLoadingError, setClarifyLoading},
        pathData: {effectivePath, path}
    }), [clarifyLoading, loadingError, visibility, animating, action, get, closeAnim, setAction, setAnimating, offlineChange, change, setVisibility, setLoadingError, setClarifyLoading, effectivePath, path])
}

export default useClarifyLogic