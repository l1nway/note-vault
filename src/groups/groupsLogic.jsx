import {useState, useRef, useEffect, useMemo, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useLocation} from 'react-router'
import Cookies from 'js-cookie'

import {clarifyStore, apiStore, appStore} from '../store'
import getGroups from './getGroups'

function groupsLogic() {

    const location = useLocation()
    const path = location.pathname.slice(1)
    
    const token = useMemo(() => ([localStorage.getItem('token'), Cookies.get('token')].find(t => t && t !== 'null')), [])

    // refs for correctly setting focus on the checkbox imitation
    const gridRef = useRef(null)
    const listRef = useRef(null)
    // to call a function from <Clarify/>
    const clarifyRef = useRef()
    
    const online = apiStore(state => state.online)

    const {tags, categories} = appStore(
        useShallow(state => ({
            tags: state.tags,
            categories: state.categories
    })))

    const {action, setAction, setVisibility, animating, setAnimating, setLoadingError, setLoadingErrorMessage, setClarifyLoading, retryFunction, setRetryFunction, setCurrentElementId} = clarifyStore(
        useShallow(state => ({
            action: state.action,
            setAction: state.setAction,
            setVisibility: state.setVisibility,
            animating: state.animating,
            setAnimating: state.setAnimating,
            setLoadingError: state.setLoadingError,
            setLoadingErrorMessage: state.setLoadingErrorMessage,
            setClarifyLoading: state.setClarifyLoading,
            retryFunction: state.retryFunction,
            setRetryFunction: state.setRetryFunction,
            setCurrentElementId: state.setCurrentElementId
    })))

    const [catsView, setCatsView] = useState('grid')
    const listView = useMemo(() => catsView == 'list', [catsView])
    const [loading, setLoading] = useState(false)
    const [elementID, setElementID] = useState('')
    const [color, setColor] = useState('')
    const [name, setName] = useState('')

    useEffect(() => {
        if (!online || !token) return
        getGroups(path, setLoading)
    }, [online, token, path])

    useEffect(() => {
        if (!online && Cookies.get('offline') !== 'true') {
            setLoadingError(true)
            setLoadingErrorMessage('No internet connection')
            setLoading(false)
        }
    }, [online, setLoadingError, setLoadingErrorMessage])

    const openAnim = useCallback((action, id) => {
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
    }, [animating, setAnimating, setAction, setRetryFunction, setClarifyLoading, setCurrentElementId, setVisibility])
    
    return useMemo(() => ({path, loading, catsView, setCatsView, listView, elementID, setElementID, color, setColor, name, setName, openAnim, retryFunction, tags, categories, action, clarifyRef, gridRef, listRef}), [path, loading, catsView, setCatsView, listView, elementID, setElementID, color, setColor, name, setName, openAnim, retryFunction, tags, categories, action, clarifyRef, gridRef, listRef])
}

export default groupsLogic