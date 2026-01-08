import './notesList.css'

import {useState, useEffect, useMemo, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import Cookies from 'js-cookie'

import {apiStore, clarifyStore} from '../store'
import getNotes from './getNotes'
import useDebounce from './useDebounce'

function notesLogic() {
    const online = apiStore(state => state.online)
    const offlineMode = apiStore(state => state.offlineMode)

    // managing windows for deleting, archiving and editing
    const {action, setAction, animating, setAnimating, setNotesError, notesError, notesLoading, setNotesLoading, setNotesMessage, notesMessage, category, tag, search, setVisibility, setClarifyLoading, setRetryFunction} = clarifyStore(
        useShallow(state => ({
            action: state.action,
            setAction: state.setAction,
            animating: state.animating,
            setAnimating: state.setAnimating,
            setNotesError: state.setNotesError,
            notesError: state.notesError,
            notesLoading: state.notesLoading,
            setNotesLoading: state.setNotesLoading,
            setNotesMessage: state.setNotesMessage,
            notesMessage: state.notesMessage,
            category: state.category,
            tag: state.tag,
            search: state.search,
            setVisibility: state.setVisibility,
            setClarifyLoading: state.setClarifyLoading,
            setRetryFunction: state.setRetryFunction
    })))

    //
    const [elementID, setElementID] = useState('')
    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(0)
    const [loadMoreText, setLoadMoreText] = useState('Load more')

    const debouncedSearch = useDebounce(search, 300)

    // checks for the presence of a token in cookies and local storage
    const token = useMemo(
        () => [localStorage.getItem('token'), Cookies.get('token')]
        .find(
            token => token
        &&
            token !== 'null'
    ))

    const queryString = useMemo(() => {
        const params = []
        
        if (category?.id)
            params.push(`category_id=${category.id}`)
        
        if (tag?.id)
            params.push(`tag_id=${tag.id}`)

        if (search)
            params.push(`q=${debouncedSearch}`)

        params.push(`page=${page}`)
        
        return params.length ? `?${params.join('&')}` : ''
    }, [category?.id, tag?.id, debouncedSearch, page])

    // gets a list of notes from the server
    useEffect(() => {
        setPage(1)
    }, [category, tag, debouncedSearch])

    useEffect(() => {
        if (online && token) {
            getNotes(queryString, page, setLastPage, setLoadMoreText)
        }
    }, [queryString, token, offlineMode])

    useEffect(() => {
        if (Cookies.get('offline') != 'true' && !online) {
            setNotesError(true)
            setNotesMessage('No internet connection')
            setNotesLoading(false)
        }
    }, [online])

    const loadMore = useCallback(() => {
        if (page < lastPage) {
            setPage(prev => prev + 1)
            setLoadMoreText('Loading')
        }
    }, [lastPage])

    const openAnim = useCallback((action) => {
        if (animating == true) {
            return false
        }
        setAnimating(true)
        setAction(action)
        setRetryFunction(action)
        setClarifyLoading(true)

        setTimeout(() => {
            setVisibility(true)
        }, 10)

        setTimeout(() => {
            setAnimating(false)
        }, 300)
    }, [animating, setAction, setRetryFunction, setClarifyLoading, setVisibility, setAnimating])

    return useMemo(() => ({notesLoading, notesError, notesMessage, action, elementID, setElementID, getNotes, openAnim, queryString, loadMore, page, lastPage, loadMoreText
    }), [notesLoading, notesError, notesMessage, action, elementID, getNotes, openAnim, queryString, loadMore, page, lastPage, loadMoreText])
}

export default notesLogic