import {useState, useRef, useEffect} from 'react'
import {useLocation} from 'react-router'
import Cookies from 'js-cookie'

import {clarifyStore, apiStore, appStore} from '../store'

function groupsLogic() {
    const online = apiStore(state => state.online)

    const {offlineMode, setOfflineMode, tags, categories} = appStore()

    const location = useLocation()
    const path = location.pathname.slice(1)
    // 

    // to call a function from <Clarify/>
    const clarifyRef = useRef()

    const token = [
            localStorage.getItem('token'),
            Cookies.get('token')
        ].find(
                token => token
            &&
                token !== 'null'
        )

    const [loading, setLoading] = useState(true)

    const {
        action, setAction,
        setVisibility,
        animating, setAnimating,
        savings, setSavings,
        loadingError, loadingErrorMessage,
        savingErrors, setSavingErrors,
        setLoadingError,
        setLoadingErrorMessage,
        setClarifyLoading,
        retryFunction, setRetryFunction,
        setCurrentElementId
    } = clarifyStore()

    const getGroups = async () => {
        setLoading(true)
        setSavings(prev => ({...prev, [path]: true}))
        try {
            const res = await fetch(`http://api.notevault.pro/api/v1/${path}`, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${token}`
                }
            })
            if (!res.ok) throw new Error(`${res.status}`)

            const resData = await res.json()

            setLoading(false)
            setSavings(prev => ({ ...prev, [path]: false }))
            setLoadingError(false)
        } catch (error) {
            setLoadingErrorMessage(error)
            setLoading(false)
            setSavings(prev => ({...prev, [path]: false}))
            if (elementID == '') setLoadingError(true)
            else setSavingErrors(prev => ({...prev, [path]: true}))
    }}

    useEffect(() => {
        if (online) {
            setOfflineMode(false)
            // token && getNotes()
            !token && setLoading(false)
            setLoading(false)
        }
        
        if (!online && !offlineMode) {
            console.log('нет инета и оффлайн режима')
            if (Cookies.get('offline') != 'true') {
                setLoadingError(true)
                setLoadingErrorMessage('No internet connection')
                setLoading(false)
                return
            }
            setOfflineMode(true)
        }

        if (offlineMode) {
            setLoadingError(false)
            setLoading(false)
        }
    }, [online, token])

    //

    const [catsView, setCatsView] = useState('grid')
    const listView = catsView == 'list'
    
    //

    // refs for correctly setting focus on the checkbox imitation
    const gridRef = useRef(null)
    const listRef = useRef(null)

    //

    const [elementID, setElementID] = useState('')
    const [color, setColor] = useState('')
    const [name, setName] = useState('')

    // 

    const openAnim = (action, id) => {
        if (animating == true) {
            return false
        }
        setAnimating(true)
        setAction(action)
        setRetryFunction(action)
        setClarifyLoading(true)
        setCurrentElementId(id)

        setTimeout(() => {
            setVisibility(true)
        }, 10)

        setTimeout(() => {
            setAnimating(false)
        }, 300)
    }
    return {
        path,

        loading,

        catsView,
        setCatsView,
        listView,

        elementID,
        setElementID,
        color,
        setColor,
        name,
        setName,

        openAnim,

        savings,
        savingErrors,
        retryFunction,

        tags,
        categories,
        action,

        clarifyRef,
        gridRef,
        listRef,
        getGroups
    }
}

export default groupsLogic