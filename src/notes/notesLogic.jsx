import './notesList.css'

import {useState, useEffect, useMemo} from 'react'
import {useLocation} from 'react-router'
import Cookies from 'js-cookie'

import {apiStore, appStore, clarifyStore} from '../store'

function notesLogic(props) {

    const {online} = apiStore()
    const {offlineMode, setOfflineMode, notes, setNotes} = appStore()
    
    const [filteredNotes, setFilteredNotes] = useState()

    const location = useLocation()
    const path = location.pathname.slice(1)

    // managing windows for deleting, archiving and editing
    const {
        action, setAction,
        animating, setAnimating,
        setNotesError, notesError,
        notesLoading, setNotesLoading,
        setNotesMessage, notesMessage,
        category, tag, search,
        setVisibility,
        setClarifyLoading,
        setRetryFunction
    } = clarifyStore()

    //
    const [elementID, setElementID] = useState('')

    // checks for the presence of a token in cookies and local storage
    const token = [localStorage.getItem('token'), Cookies.get('token')]
        .find(
            token => token
        &&
            token !== 'null'
    )

    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(0)

    const queryString = useMemo(() => {
        const params = []
        
        if (category?.id)
            params.push(`category_id=${category.id}`)
        
        if (tag?.id)
            params.push(`tag_id=${tag.id}`)

        if (search)
            params.push(`q=${search}`)

        params.push(`page=${page}`)
        
        return params.length ? `?${params.join('&')}` : ''
    }, [category?.id, tag?.id, search, page])

    // gets a list of notes from the server
    const getNotes = async () => {
        try {
            setNotesLoading(true)
            setNotesError(false)

        const res = await fetch(
        `http://api.notevault.pro/api/v1/notes${queryString}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) throw new Error('Fetch failed')
        
        const resData = await res.json()
        page == 1 ? setNotes(resData.data) : setNotes(prev => [...prev, ...resData.data])
        console.log(resData.data)

        setLastPage(resData.last_page)
    } catch (error) {
        setNotesMessage(error.message)
        setNotesError(true)
    } finally {
        setNotesLoading(false)
    }}

    useEffect(() => {
        setPage(1)
    }, [category, tag, search])

    useEffect(() => {
        if (online && token) {
            getNotes()
        }
    }, [queryString, online, token])

    useEffect(() => {
        if (online) {
            setOfflineMode(false)
        } else if (!offlineMode) {
            if (Cookies.get('offline') != 'true') {
                setNotesError(true)
                setNotesMessage('No internet connection')
            } else {
                setOfflineMode(true)
            }
        }
    }, [online])

    const loadMore = () => {
        if (page < lastPage) {
            setPage(prev => prev + 1)
        }
    }

    const openAnim = (action) => {
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
    }

    return {
        notesLoading,
        notesError,
        notesMessage,
        action,
        elementID,
        setElementID,
        getNotes,
        openAnim,
        filteredNotes,
        queryString,
        loadMore,
        page,
        lastPage
    }
}

export default notesLogic