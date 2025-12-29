import {useState, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import Cookies from 'js-cookie'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTriangleExclamation, faXmark, faArrowUp as faArrowUpSolid, faBookmark as faBookmarkSolid} from '@fortawesome/free-solid-svg-icons'

import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'

import {apiStore} from '../store'

function User() {
    const online = apiStore(state => state.online)

    const {t} = useTranslation()
    
    // universal function for convenient routing of all values ​​from local storage and cookies
    const storedValue = (key) => {
        return [
            localStorage.getItem(key),
            Cookies.get(key)
                ].find(
                    val => val && val !== 'null'
                ) || ''
    }

    // individual token of the logged-in user
    const token = storedValue('token')

    // getting user information from the server
    const getUser = () => {
            fetch(`http://api.notevault.pro/api/v1/auth/me`,
                {
                    method: 'GET',
                    headers: {
                        'content-type': 'application/json',
                        authorization: 
                            `Bearer ${token}`
                    }
                })
        // .then(res => res.json())
        // .then(resData => console.log(resData))
    }

    // triggers a call at the time of first load
    useEffect(() => getUser(), [])

    // как 
    const remember = true

    const changeName = () => {
        fetch(`http://api.notevault.pro/api/v1/profile`,
            {
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    authorization:
                        `Bearer ${token}`
                },
                    body: JSON.stringify({
                        name: name
                    })
            })
        .then(res => res.json())
        .then(resData => {
            console.log(resData, 'change name')
                remember
                ?   localStorage.setItem('name', resData.name)
                :   Cookies.set('name', resData.name, {expires: 1})
            setStoredName(resData.name)

            setNameSaved(true)
            setTimeout(() => {
                setNameSaved(false)
                }, 7000)
        })
        .catch(error => {
            inputShake()
        })
    }

    //
    const [nameSaved, setNameSaved] = useState(false)

    // states for values
    const [name, setName] = useState(storedValue('name'))
    const [nameError, setNameError] = useState(false)
    const [email, setEmail] = useState(storedValue('email'))
    const verifed = storedValue('verif')

    // 
    const [storedName, setStoredName] = useState(storedValue('name'))

    // checking password matches
    const nameEdited = name !== storedName
    const emailEdited = email !== storedValue('email')

    // displaying a message about sending verification
    const [sendVerif, setSendVerif] = useState(false)

    // displaying a message about unavailability of email editing
    const [prohibited, setProhibited] = useState(false)
    
    let nameStatus
        if (nameError) {
            nameStatus = 'error'
        } else if (name == '') {
            nameStatus = 'empty'
        } else if (nameSaved) {
            nameStatus = 'saved'
        } else {
            nameStatus = 'unsaved'
        }

    const nameText = {
        error: 'Error saving changes',
        empty: 'Name cannot be empty',
        unsaved: 'Name unsaved',
        saved: 'Name saved'
    }

    const nameRef = useRef(null)

    const inputShake = () => {
        setNameError(true)
        const el = nameRef?.current
        if (!el) return

        el.classList.remove('--animated-error')
        void el.offsetWidth
        el.classList.add('--animated-error')
    }

    return (
        <form
            className='profile-values'
        >
            <label
                className='profile-name'
            >
                <span
                    className='profile-name-group'
                >
                    <div
                        className='name-title-group'
                    >
                        <p
                            className='name-title'
                        >
                            {t('Username')} 
                        </p>
                        <SlideLeft
                            visibility={nameError}
                        >
                            <FontAwesomeIcon
                                className='newnote-loading-error'
                                icon={faTriangleExclamation}
                                onClick={() => retryLoad()}
                                tabIndex='0'
                            />
                        </SlideLeft>
                    </div>
                    <SlideLeft
                        visibility={nameEdited || nameSaved}
                    >
                        <p
                            key={nameStatus}
                            className={`name-status --${nameStatus}`}
                        >
                            {t(nameText[nameStatus])}
                        </p>
                    </SlideLeft>
                </span>
                <input
                    className={`name-input ${(nameError || name == '') && '--animated-error'}`}
                    ref={nameRef}
                    type='text'
                    value={name}
                    onFocus={() => {
                        setNameSaved(false)
                    }}
                    onChange={e => {
                        setName(e.target.value)
                        setNameError(false)
                    }}
                />
            </label>
            <label
                className='profile-email'
            >
                <span
                    className='profile-email-group'
                >
                    <p
                        className='profile-email-title'
                    >
                        {t('E-Mail')}
                    </p>
                    <SlideLeft
                        visibility={emailEdited}
                    >
                        <p
                            className='name-unsaved'
                        >
                            {t('Email unsaved')}
                        </p>
                    </SlideLeft>
                    <SlideLeft
                        visibility={prohibited}
                    >
                        <p
                            className='name-unsaved'
                        >
                            {t('Email editing is not yet available')}
                        </p>
                    </SlideLeft>
                </span>
                <input
                    className='profile-email-input'
                    type='text'
                    value={email}
                    onFocus={() => setProhibited(true)}
                    onBlur={() => setProhibited(false)}
                    readOnly
                    onChange={e => (
                        setEmail(e.target.value))}
                />
            </label>
            <SlideDown
                visibility={(name !== '' && nameEdited) || emailEdited}
            >
                <div
                    className='values-buttons'
                >
                    <button
                        type='button'
                        className='values-save'
                        tabIndex={nameEdited || emailEdited ? 0 : -1}
                        onClick={() => changeName()}
                    >
                        {t('save')}
                    </button>
                    
                    <button
                        type='button'
                        className='values-cancel'
                        onClick={() => {
                            setName(storedValue('name')),
                            setEmail(storedValue('email'))
                        }}
                        tabIndex={nameEdited || emailEdited ? 0 : -1}
                    >
                        {t('cancel')}
                    </button>
                </div>
            </SlideDown>  
            <SlideDown
                visibility={!verifed}
            >
                <span
                    className='profile-email-unverifed'
                >
                    {t("Isn't verifed yet")}
                </span>
            </SlideDown>
            <SlideDown
                visibility={!verifed}
            >
                <button
                    className='verify-button'
                    type='button'
                    onClick={() => setSendVerif(true)}
                >
                    {t('Verify email')}
                </button>
            </SlideDown>
            <SlideDown
                visibility={sendVerif}
            >
                <span
                    className='profile-email-sended'
                >
                    {t("Verification link has been sent to your email address")}
                </span>
            </SlideDown>
        </form>
    )}
    
    export default User