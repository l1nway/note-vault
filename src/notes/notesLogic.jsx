import './notesList.css'

import {useState, useEffect} from 'react'
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
        setVisibility,
        setSavings,
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

    useEffect(() => {
        if (online) {
            setOfflineMode(false)
            token && getNotes()
            !token && setNotesLoading(false)
        }

        if (!online && !offlineMode) {
            console.log('нет инета и оффлайн режима')
            setNotesError(true)
            setNotesMessage('No internet connection')
            setNotesLoading(false)
        }

        if (offlineMode) {
            setNotesError(false)
            setNotesLoading(false)
        }
    }, [online, offlineMode, token])

    const category = props.category?.id ? `?category_id=${props.category.id}` : ''
    const tag = props.tag?.id ? `?tag_id=${props.tag.id}` : ''
    const search = props.search || ''

    const params = []

    if (props.category?.id)
        params.push(`category_id=${props.category.id}`)
    
    if (props.tag?.id)
        params.push(`tag_id=${props.tag.id}`)

    if (props.search)
        params.push(`q=${search}`)
    //     

    const queryString = params.length ? `?${params.join('&')}` : ''

    // gets a list of notes from the server
    const getNotes = async () => {
        console.log('запущен поиск заметок')
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
        console.log(resData.data)
        setNotes(resData.data)
        const serverNotes = resData.data

        const serverMap = {}
        serverNotes.forEach(note => {
            serverMap[note.id] = note
        })

        const mergedNotes = []

        notes.forEach(localNote => {
            const serverNote = localNote.id ? serverMap[localNote.id] : null

            if (serverNote) {
                mergedNotes.push({
                    ...localNote,
                    ...serverNote,
                    syncing: localNote.syncing || false,
                    offline: localNote.offline || false,
                    syncAction: localNote.syncAction || null
                })
                delete serverMap[localNote.id]
            } else {
                mergedNotes.push(localNote)
            }
        })

        Object.values(serverMap).forEach(note => mergedNotes.push(note))

        const hasChanges = (() => {
            if (mergedNotes.length !== notes.length) return true

            const localMap = {}
            notes.forEach(note => {
                if (note.id) localMap[note.id] = note.updated_at
            })

            for (const note of mergedNotes) {
                if (!note.id) continue
                if (!(note.id in localMap)) return true
                if (note.updated_at !== localMap[note.id]) return true
            }

            return false
        })()

        if (hasChanges) {
            console.log('differences between the notes')
        } else {
            console.log('no differences between the notes')
        }

        // queryString ? setFilteredNotes(mergedNotes) : setNotes(mergedNotes)
        queryString ? console.log('фильтр') : console.log('полный список')

        setSavings(prev => ({...prev, [path]: false}))
        setNotesLoading(false)
    } catch (error) {
        setNotesMessage(error.message)
        setNotesLoading(false)
        setNotesError(true)
    }}

    useEffect(() => {
        if (online && token) getNotes()
    },[category, tag, search])

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
        queryString
    }
}

export default notesLogic