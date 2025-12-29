import './profile.css'

import {useState, useRef, useEffect} from 'react'
import Cookies from 'js-cookie'

import {profileStore, apiStore, appStore} from '../store'

function profileLogic() {

    // 
    const {online} = apiStore()
    const {offlineMode, setOfflineMode} = appStore()
    
    // checks for the presence of a token in cookies and local storage
    const token = localStorage.getItem('token') || Cookies.get('token') || ''

    // checks for the presence of a registration date in cookies and local storage
    const accDate = localStorage.getItem('accdate') || Cookies.get('accdate')

    // 

    // status of file dragging
    const [drag, setDrag] = useState(false)

    const {
        profileLoading, setProfileLoading,
        profileSaving, setProfileSaving,
        profileError, setProfileError,
        profileMessage, setProfileMessage,
        // state for a file in the editor
        tempFile, setTempFile,
        // state if the uploaded file is not an image
        fileError, setFileError,
        // state for a final file
        setFile, file
    } = profileStore()


    // ref for drag&drop file upload
    const fileRef = useRef(null)

    //

    // func for drag&drop file in input
    const handleFile = (uploaded) => {
        // checks if it is an image, if not, shows an error
        if (!uploaded || !uploaded.type || !uploaded.type.startsWith('image/')) {
            setFileError(true)
            // sets a timer after which the error message will disappear
            setTimeout(() => 
                setFileError(false), 7000
            )
            return
        }

        // to be sure
        setFileError(false)
        setTempFile(uploaded)
        // const dt = new DataTransfer()
        // dt.items.add(uploaded)
        // fileRef.current.files = dt.files
    }
    
    // request to the server to delete the avatar
    const delAvatar = () => {
        fetch(`http://api.notevault.pro/api/v1/profile/avatar`,
            {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json',
                    authorization:
                        `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(() => {
                setFile(null),
                localStorage.removeItem('avatar'),
                Cookies.remove('avatar')
            })
    }
    
    // 
    useEffect(() => {
        setFile(localStorage.getItem('avatar') || Cookies.get('avatar'))
    }, [])

    useEffect(() => {
        if (online) {
            setOfflineMode(false)
        }

        if (!online && !offlineMode) {
            console.log('нет инета и оффлайн режима')
            setProfileError(true)
            setProfileMessage('No internet connection')
            setProfileLoading(false)
        }
        
        if (!token) {
            setProfileLoading(false)
            return
        }

        if (offlineMode) {
            setProfileError(false)
            setProfileLoading(false)
        }
    }, [online, offlineMode, token])

    return {
        accDate,
        drag,
        setDrag,
        fileRef,
        handleFile,
        delAvatar
    }
}

export default profileLogic