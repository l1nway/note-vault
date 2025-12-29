import {useEffect} from 'react'
import {useLocation, useNavigate} from 'react-router'
import Cookies from 'js-cookie'
import {clarifyStore} from '../store'

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
        setRetryFunction
    } = clarifyStore()

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
    
    // path does not always match the server, here the correspondences are configured
    const basePath =
        path == 'archive' || path == 'trash' || path.startsWith('notes/note')
            ? 'notes'
            : path

    // list of configured pathnames
    const urls = {
        archive:   `${basePath}/${props.id}/archive`,
        unarchive: `${basePath}/${props.id}/unarchive`,
        force:     `${basePath}/${props.id}/force`,
        restore:   `${basePath}/${props.id}/restore`,
        new:       `${basePath}`,
    }

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

    // different methods are used for different actions; object with correspondences
    const methods = {
        new: 'POST',
        archive: 'POST',
        unarchive: 'POST',
        edit: 'PATCH',
        delete: 'DELETE',
        force: 'DELETE'
    }

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
        const currentName = retryContext?.name || props.name
        const currentColor = retryContext?.color || props.color

        setSavings(prev => ({...prev, [props.id]: true, [path]: true}))

        // final URL regarding the user's action and link
        const url = `http://api.notevault.pro/api/v1/${
            urls[currentAction] ?? `${basePath}/${props.id}`
        }`

        // matching a method to a user action
        const method = methods[currentAction]

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                },
                ...(['POST', 'PATCH', 'PUT'].includes(method) 
                    ? {
                        body: JSON.stringify(path == 'categories' ? {
                            name: currentName,
                            color: currentColor
                        } : {
                            name: currentName
                        })
                    }
                    : {})
            })

            if (!res.ok) {
                throw new Error('Server Error')
            }

            const text = await res.text()
            const resData = text ? JSON.parse(text) : {}

            if (renavigate) navigate('/notes')
            // if successful, the data saving icon is removed
            setSavings(prev => ({...prev, [props.id]: false, [path]: false}))

            const activeIdInStore = clarifyStore.getState().currentElementId;

            if (currentAction == 'new' || currentId == activeIdInStore) {
                if (!visibility && action !== false) {
                    closeAnim()
                }
            }

            try {
                setSavings(prev => ({...prev, [currentId]: false}))
                removeSavingError(currentId, path)

                // updating the list of objects
                if (currentAction == 'delete' || currentAction == 'force') {
                    setNotes(prev => prev.filter(note => note.id !== currentId))
                }

                
                // if Clarify was mounted only to try to download data from the server again after error, then it is unmounted back
                const activeIdInStore = clarifyStore.getState().currentElementId
                    if (currentAction == 'new' || currentId == activeIdInStore) {
                        if (!visibility && action !== false) closeAnim()
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
            categories: props.setGroups,
            notes: props.setNotes,
            tags: props.setGroups,
            trash: props.setTrash,
            archive: props.setTrash
        }

        // matching by path
        const setter = setterMap[path]
            
        if (action == 'edit') {
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
            setSavings(prev => ({...prev, [props.id]: true}))

            setter(prev => {
                const newGroup = [...prev, {
                    name: props.name,
                    color: props.color,
                    notes_count: 0
                }]
                return newGroup.sort((a, b) => a.name.localeCompare(b.name))
            })
            change()
            closeAnim()
        } else {
            // delete, archive, force, unarchive
            setSavings(prev => ({...prev, [currentId]: true}))
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
            change,
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