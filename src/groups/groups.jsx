import './groups.css'

import {useState, useRef, useEffect} from 'react'
import ContentLoader from 'react-content-loader'
import {Link, useLocation} from 'react-router'
import {useTranslation} from 'react-i18next'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTableCells as faTableCellsSolid, faList as faListSolid, faPenToSquare, faTrash as faTrashSolid, faTag, faFloppyDisk, faTriangleExclamation, faRotateRight, faTrashCan, faTrashCanArrowUp, faSignal} from '@fortawesome/free-solid-svg-icons'

import Clarify from '../components/clarify'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'

import {apiStore, appStore, clarifyStore, pendingStore} from '../store'

function Groups() {
    const online = apiStore(state => state.online)
    const {offlineMode, setOfflineMode, setOfflineCategories, setOfflineTags} = appStore()
    // 
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
        currentElementId, setCurrentElementId
    } = clarifyStore()

    const {
        undo,
        pendings
    } = pendingStore()

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
            setGroups(resData)

            if (path == 'tags') setOfflineTags(resData)
            else setOfflineCategories(resData)

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
        if (!online) {
            setLoading(false)
            setLoadingError(true)
            setLoadingErrorMessage('No internet connection')
            setGroups([])
            return
        }

        if (online) {
            if (token) {
                getGroups()
            } else {

            }
        }
    }, [online, token])

    const {t} = useTranslation()

    // 

    // 

    const [catsView, setCatsView] = useState('grid')
    const listView = catsView == 'list'
    
    //

    // refs for correctly setting focus on the checkbox imitation
    const gridRef = useRef(null)
    const listRef = useRef(null)

    //

    // array with all groups
    const [groups, setGroups] = useState([])

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

    const renderGroups = groups.map((element, index) =>
        <Link
            to='/notes'
            className={`group-element ${
                pendings.some(p => p.id == element.id)
                    ? '--disappearance'
                    : ''
            }`}
            key={index}
            state={{
                sort: path,
                value: element
            }}
            onClick={e =>{
                if (pendings.some(p => p.id == element.id)){
                    e.preventDefault()
                    undo(element.id)
                }
                if (savingErrors[path]?.[element.id]) {
                    e.preventDefault()
                    setElementID(element.id)
                    openAnim(savingErrors[path]?.[element.id]?.action, element.id)
                    setName(savingErrors[path]?.[element.id]?.name, element.id)
                    setColor(savingErrors[path]?.[element.id]?.color, element.id)
                }
            }}
        >
            {/* input for css only */}
            <input
                type='checkbox'
                className='list-view'
                checked={catsView == 'list'}
                onChange={() => setCatsView(catsView == 'list' ? 'grid' : 'list')}
            />
            <div
                className={`group-buttons ${(
                    pendings.some(p =>
                        p.id == element.id) || savingErrors[path]?.[element.id])
                            ? '--blocked'
                            : ''
                }`}
            >
                <FontAwesomeIcon
                    className='button-archive'
                    icon={faPenToSquare}
                    onClick={(e) => {
                        e.preventDefault()
                        if (animating == true) {
                            return false
                        }
                        
                        if (savingErrors[path]?.[element.id]) {
                            openAnim(savingErrors[path]?.[element.id]?.action, element.id)
                            setName(savingErrors[path]?.[element.id]?.name, element.id)
                            setColor(savingErrors[path]?.[element.id]?.color, element.id)
                            return
                        }

                        openAnim('edit', element.id)
                        setElementID(element.id)
                        setColor(element.color)
                        setName(element.name)
                    }}
                />
                <FontAwesomeIcon
                    className='button-delete'
                    icon={faTrashSolid}
                    onClick={(e) => {
                        e.preventDefault()
                        if (animating == true) {
                            return false
                        }
                        
                        setElementID(element.id)
                        openAnim('delete', element.id)
                    }}
                />
            </div>
            <div
                className='group-content'
            >
                {path == 'tags' ? 
                    <FontAwesomeIcon
                        icon={faTag}
                        className='group-tag'
                    />
                : 
                    <div
                        className='group-color'
                        style={{
                            '--color': element.color
                        }}
                    />
                }
                <div
                    className='group-title-top'
                >
                    <div
                        className='group-title'
                    >
                        {savingErrors[path]?.[element.id]
                            ? `#${savingErrors[path]?.[element.id]?.name}`
                            : (path === 'tags' ? `#${element.name}` : element.name)
                        }
                    </div>
                    <SlideLeft
                        visibility={savings[element.id]}
                    >
                        <FontAwesomeIcon
                            className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                            icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={savingErrors[path]?.[element.id]}
                    >
                        <FontAwesomeIcon
                            className='loading-error-icon'
                            icon={faTriangleExclamation}
                            onClick={(e) => {
                                e.preventDefault()
                                setElementID(element.id)
                                openAnim(savingErrors[path]?.[element.id]?.action, element.id)
                                setName(savingErrors[path]?.[element.id]?.name, element.id)
                                setColor(savingErrors[path]?.[element.id]?.color, element.id)
                            }}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={pendings.some(p => p.id == element.id)}
                    >
                        <FontAwesomeIcon
                            className='loading-save-icon --restore'
                            icon={faTrashCanArrowUp}
                            onClick={(e) => {
                                e.preventDefault()
                                undo(element.id)
                            }}
                        />
                    </SlideLeft>
                </div>
                <div
                    className='group-amount'
                >
                    {element.notes_count} notes
                </div>
            </div>
        </Link>
    )

    return(
        <div
            className='groups-main'
        >
            {/* header  */}
            <div
                className='groups-top'
            >
                <div
                    className='groups-top-title'
                >
                    <h1
                        className='groups-title'
                    >
                        {t(path)}
                    </h1>
                    <SlideLeft
                        visibility={savings[path]}
                    >
                        <FontAwesomeIcon
                            className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                            icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                            onClick={() => console.log(savingErrors)}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={(
                            Object.keys(savingErrors[path] || {}).length > 0) ||
                            loadingError
                    }
                    >
                        <FontAwesomeIcon
                            className='loading-error-icon'
                            icon={faTriangleExclamation}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={!savingErrors}
                    >
                        <span
                            className='notes-error-text'
                        >
                            {t(loadingErrorMessage)}
                        </span>
                    </SlideLeft>
                </div>
                <div
                    className='groups-buttons'
                >
                    <label
                        className={`groups-view ${(false) && '--disabled'}`}
                    >
                        <FontAwesomeIcon
                            tabIndex='0'
                            className='view-icon'
                            icon={faTableCellsSolid}
                            ref={gridRef}
                        />
                        <FontAwesomeIcon
                            tabIndex='0'
                            className='view-icon'
                            icon={faListSolid}
                            ref={listRef}
                        />
                        <input
                            type='checkbox'
                            disabled={loadingError}
                            checked={catsView == 'list'}
                            onChange={() => setCatsView(catsView == 'list' ? 'grid' : 'list')}
                        />
                    </label>
                    <button
                        // className={`notes-new ${(!online && !offlineMode) && '--new-disabled'}`}
                        // onClick={(e) => (!online && !offlineMode) && e.preventDefault()}
                        className='groups-new'
                        onClick={() => openAnim('new')}
                        disabled={!online && !offlineMode}
                    >
                        + {t(path == 'tags' ? 'New tag' : 'New category')}
                    </button>
                </div>
            </div>
                <SlideDown
                    visibility={listView}
                >
                    <div
                        className='groups-table'
                    >
                        <p
                            className='tab-element'
                        >
                            {t('title')}
                        </p>
                        <p
                            className='tab-element'
                        >
                            {t('archive & delete')}
                        </p>
                    </div>
                </SlideDown>
                <SlideDown
                    visibility={loading}
                >
                    <div
                        className='groups-list'
                    >
                        <ContentLoader
                            className='group-element'
                            speed={2}
                            width={300}
                            height={120}
                            backgroundColor='#1e2939' 
                            foregroundColor='#72bf00'
                            aria-label={undefined}
                            title={undefined}
                            preserveAspectRatio='none'
                        >
                            {/* 
                                rx & ry -- border-radius
                                x -- расположение по горизонтали
                                y -- расположение по вертикали
                            */}
                            
                            <circle cx='25' cy='30' r='25' /> 
                            <rect x='0' y='70' rx='4' ry='4' width='150' height='25' 
                            />
                            <rect x='0' y='105' rx='3' ry='3' width='80' height='15' 
                            />
                        </ContentLoader>
                    </div>
                </SlideDown>
                <SlideDown
                    visibility={!loading}
                >
                    <div
                        className='groups-list'
                    >
                        {renderGroups}
                    </div>
                </SlideDown>
                <SlideDown
                    visibility={loadingError}
                >
                    <div
                        className='groups-loading-error'
                        onClick={() => {
                            online ? turnOnlineMode() : setOfflineMode(true)
                        }}
                        // onClick={() => {
                        //     if (online) {
                        //         getGroups()
                        //         setLoading(true)
                        //         setLoadingError(false)
                        // }}}
                    >
                        <div
                            className='loading-error-message'
                        >
                            <FontAwesomeIcon
                                className='loading-error-icon --general'
                                icon={faTriangleExclamation}
                            />
                            <div
                                className='error-groups'
                            >
                                <span>
                                    {t('Error loading')} {t(path)}.
                                </span>
                                <span>
                                    {t(loadingErrorMessage)}
                                </span>
                            </div>
                        </div>
                    <SlideDown
                        visibility={online && loadingError}
                    >
                        <label
                            className='loading-retry-action'
                        >
                            <input
                                type='checkbox'
                                className='loading-retry-checkbox'
                                defaultChecked
                            />
                            <FontAwesomeIcon
                                className='loading-retry-icon'
                                icon={faRotateRight}
                            />
                            <span>
                                {t('retry?')}
                            </span>
                        </label>
                    </SlideDown>
                    <SlideDown
                        visibility={!online && loadingError}
                    >
                        <div
                            className='newnote-retry-action'
                        >
                            <FontAwesomeIcon
                                className='newnote-signal-icon'
                                icon={faSignal}
                            />
                            <span
                                className='newnote-offline-text'
                            >
                                {t('Go to offline mode?')}
                            </span>
                        </div>
                    </SlideDown>
                    </div>
                </SlideDown>
            {action ?
                <Clarify
                    ref={clarifyRef}
                    id={elementID}
                    setID={setElementID}
                    color={color}
                    setColor={setColor}
                    name={name}
                    setName={setName}
                    getGroups={getGroups}
                    setGroups={setGroups}
                />
            : null}
        </div>
    )
}

export default Groups