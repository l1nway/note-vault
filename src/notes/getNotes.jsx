import Cookies from 'js-cookie'
import {appStore, clarifyStore} from '../store'

const getNotes = async (
    queryString = '',
    page = 1,
    setLastPage = () => {},
    setLoadMoreText = () => {}
) => {
    const {notes, setNotes} = appStore.getState()
    const {setNotesError, setNotesLoading, setNotesMessage} = clarifyStore.getState()
    // 
    const token = [
        localStorage.getItem('token'),
        Cookies.get('token')
    ].find(
        token => token
    &&
        token !== 'null'
    )

    try {
        notes.length == 0 && setNotesLoading(true)
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

    setLastPage?.(resData.last_page)
} catch (error) {
    setNotesMessage(error.message)
    setNotesError(true)
} finally {
    setNotesLoading(false)
    setLoadMoreText('Load more')
}}

export default getNotes