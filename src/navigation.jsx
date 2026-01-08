import {useEffect, useState, useRef, createRef, useMemo, useCallback} from 'react'
import {Link, useLocation, Route, Routes, useNavigate, Navigate} from 'react-router'
import {useTranslation} from 'react-i18next'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import Cookies from 'js-cookie'

import './navigation.css'
import './App.css'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBook as faBookSolid} from '@fortawesome/free-solid-svg-icons'
import {faNoteSticky as faNoteStickySolid} from '@fortawesome/free-solid-svg-icons'
import {faFolder as faFolderSolid} from '@fortawesome/free-solid-svg-icons'
import {faTag as faTagSolid} from '@fortawesome/free-solid-svg-icons'
import {faBoxArchive as faBoxArchiveSolid} from '@fortawesome/free-solid-svg-icons'
import {faTrash as faTrashSolid} from '@fortawesome/free-solid-svg-icons'
import {faUser as faUserSolid} from '@fortawesome/free-solid-svg-icons'
import {faArrowRightFromBracket as faArrowRightFromBracketSolid} from '@fortawesome/free-solid-svg-icons'

import {appStore, profileStore, notesViewStore, screenStore, clarifyStore, pendingStore, editorStore, settingStore, tokenStore} from './store'

import Profile from './profile/profile'
import Notes from './notes/notes'
    import NewNote from './notes/newNote'
    import Note from './notes/note'
import Groups from './groups/groups'
import Trash from './trash/trash'

function Navigation() {

    const {t} = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    
    const guestMode = appStore(state => state.guestMode)

    // universal function for convenient routing of all values ​​from local storage and cookies
    const storedValue = useCallback((element) => {
        return [
            localStorage.getItem(element),
            Cookies.get(element)
                ].find(
                    val => val && val !== 'null'
                ) || ''
    }, [])

    const auth = {
        // individual token of the logged-in user
        token: storedValue('token'),
        name: storedValue('name'),
        email: storedValue('email'),
        avatar: storedValue('avatar'),
    }

    // object with the number of objects at each endpoint
    const [amount, setAmount] = useState([])

    // 
    const [ghost, setGhost] = useState({
        active: false,
        style: {},
        className: ''
    })

    const ghostRefs = useRef(new Map())

    const navLinksWrapper = useRef(null)

    const [nowLink, setNowLink] = useState(location.pathname)

    const handleGhostMove = useCallback(async (targetLink) => {
        
        if (targetLink == nowLink) return

        const sourceEl = ghostRefs.current.get(nowLink)
        const targetEl = ghostRefs.current.get(targetLink)
        const container = navLinksWrapper.current

        if (!sourceEl || !targetEl || !container) {
            setNowLink(targetLink)
            return
        }

        const containerRect = container.getBoundingClientRect()
        const sourceRect = sourceEl.getBoundingClientRect()
        const targetRect = targetEl.getBoundingClientRect()

        const start = {
            top: sourceRect.top - containerRect.top,
            left: sourceRect.left - containerRect.left,
            width: sourceRect.width,
            height: sourceRect.height
        }

        const end = {
            top: targetRect.top - containerRect.top,
            left: targetRect.left - containerRect.left,
            width: targetRect.width,
            height: targetRect.height
        }

        setGhost({
            active: true,
            style: start,
            className: 'ghost-element'
        })

        await nextFrame()
        await nextFrame()

        setGhost({
            active: true,
            style: end,
            className: 'ghost-element animate'
        })

        await wait(300)

        setNowLink(targetLink)

        setGhost({
            active: false,
            style: end,
            className: ''
        })
    }, [nowLink])

    const nodeRefs = useRef({})

    const navRef = useRef(null)

    const locationKey = location.pathname

    if (!nodeRefs.current[locationKey]) {
        nodeRefs.current[locationKey] = createRef()
    }

    const nodeRef = nodeRefs.current[locationKey]

    useEffect(() => {
        setNowLink(location.pathname)
    }, [location])

    const navlinks = useMemo(() => [
        {
            title: 'All notes',
            link: '/notes',
            icon: faNoteStickySolid,
            color: '#f7e983'
        },{
            title: 'categories',
            link: '/categories',
            icon: faFolderSolid,
            color: '#ffce01'
        },{
            title: 'tags',
            link: '/tags',
            icon: faTagSolid,
            color: 'azure'
        },{
            title: 'archive',
            link: '/archived',
            icon: faBoxArchiveSolid,
            color: '#ffdaaa'
        },{
            title: 'trash',
            link: '/trash',
            icon: faTrashSolid,
            color: '#e5010b'
        }
    ], [])

    const redirect = useCallback((link, e) => {
        if (nowLink == link) {
            e.preventDefault()
            return
        }
        handleGhostMove(link)
        setMenu(false)
    }, [nowLink, handleGhostMove])

    const renderLinks = useMemo(() => 
        navlinks.map((element, index) =>
            <Link
                to={element.link}
                key={index}
                ref={(el) => {
                    if (el) ghostRefs.current.set(element.link, el)
                    else ghostRefs.current.delete(element.link)
                }}
                className='nav-link'
                onClick={(e) => redirect(element.link, e)}
            >
                <label
                    className='link-label'
                >
                    <div
                        className='nav-title'
                    >
                        <FontAwesomeIcon
                            className='nav-icon'
                            icon={element.icon}
                            style={{color: element.color}}
                        />
                        <div
                            className='nav-text'
                        >
                            {t(element.title)}
                        </div>
                    </div>

                    {amount[index] > 0 && (
                        <div
                            className='nav-amount'
                        >
                            {amount[index]}
                        </div>
                    )}

                    <input
                        id={`link-${index}`}
                        type='radio'
                        name='navlink'
                        checked={nowLink == element.link}
                        readOnly
                    />
                </label>
            </Link>
        ), [navlinks, nowLink, amount, t, handleGhostMove]
    )

    const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve))

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    //

    const [menu, setMenu] = useState(false)

    const stores = [appStore, profileStore, notesViewStore, screenStore, clarifyStore, pendingStore, editorStore, settingStore, tokenStore]

    const logout = useCallback(() => {
        const keys = ['token', 'name', 'email', 'verif', 'accdate', 'avatar', 'remember']
        keys.forEach(k => localStorage.removeItem(k))
        keys.forEach(k => Cookies.remove(k))

        stores.forEach(store => {
            store.setState({}, true)
        })

        navigate('/login')
    }, [navigate])

    return(
        <>
            <div
                className='nav-main'
            >
                        <div
                            className='nav-logo'
                        >
                            <FontAwesomeIcon
                                className='logo-pic'
                                icon={faBookSolid}
                            />
                            <div>
                                Note Vault
                            </div>
                        </div>

                        <div
                            className='nav-group'
                            onClick={() => setMenu(!menu)}
                            ref={navRef}
                            tabIndex='1'
                        >
                            <div
                                className={`hamburger-icon ${menu ? 'open' : ''}`}
                            >
                                <span/>
                                <span/>
                                <span/>
                                <span/>
                            </div>

                            <div
                                className={`nav-links ${menu ? 'visible' : ''}`}
                                ref={navLinksWrapper}
                            >
                                {renderLinks}
                                {ghost.active && (
                                    <div
                                        className={ghost.className}
                                        style={ghost.style}
                                    />
                                )}
                            </div>
                        </div>
                    <div
                        className='nav-profile'
                        onClick={() => setMenu(false)}
                    >
                        <Link
                            className='profile-text'
                            to={auth.token ? '/profile' : '/login'}
                            tabIndex='0'
                        >
                            {auth.token ?
                                <img
                                    className='profile-img'
                                    src={auth.avatar}
                                />
                            :
                                <FontAwesomeIcon
                                    className='profile-icon'
                                    icon={faUserSolid}
                                />
                            }
                            <div
                                className='profile-info'
                            >
                                {!auth.token ?
                                    <div
                                        className='not-authorized'
                                    >
                                        {t('not authorized')}
                                    </div>
                                    :
                                    <>
                                        <p
                                            className='navbar-name'
                                        >
                                            {auth.name}
                                        </p>
                                        <p
                                            className='navbar-email'
                                        >
                                            {auth.email?.replace(/^[^@]+/, '…')}
                                        </p>
                                    </>
                                }
                            </div>
                        </Link>
                        {/* logout button present only if the user is logged in*/}
                        {auth.token
                            ? 
                                <FontAwesomeIcon
                                    className='logout-icon'
                                    icon={faArrowRightFromBracketSolid}
                                    onClick={() => logout()}
                                />
                            :
                                null
                        }
                    </div>
            </div>
            {/*  */}
            <div
                className='content-wrapper'
            >
                <TransitionGroup
                    component={null}
                >
                    <CSSTransition
                        key={location.pathname}
                        nodeRef={nodeRef}
                        classNames='nav-change'
                        timeout={300}
                    >
                        <div
                            ref={nodeRef}
                            className='nav-routing'
                        >
                            <Routes
                                location={location}
                            >
                                <Route path="*" element={<Navigate to='/notes' replace/>}/>
                                <Route 
                                    path='profile'
                                    element={auth.token || guestMode ? <Profile/> : <Navigate to='/login' replace />} 
                                />
                                <Route path='notes' element={<Notes/>}/>
                                    <Route path='notes/new' element={<NewNote/>}/>
                                    <Route path='notes/edit/:id' element={<NewNote/>}/>
                                    <Route path='notes/note/:id' element={<Note/>}/>
                                <Route path='categories' element={<Groups/>}/>
                                <Route path='tags' element={<Groups/>}/>
                                <Route path='archived' element={<Trash/>}/>
                                <Route path='trash' element={<Trash/>}/>
                            </Routes>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </div>
        </>
    )
}

export default Navigation