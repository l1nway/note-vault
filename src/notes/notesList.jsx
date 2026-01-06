import './notesList.css'
import Cookies from 'js-cookie'
import {motion, AnimatePresence} from 'framer-motion'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useState, useMemo} from 'react'
import ContentLoader from 'react-content-loader'
import {useLocation} from 'react-router'
import {useTranslation} from 'react-i18next'

import {faPlaneCircleCheck, faTriangleExclamation, faRotateRight, faSignal} from '@fortawesome/free-solid-svg-icons'

import {appStore, clarifyStore} from '../store'

import SlideDown from '../components/slideDown'
import Clarify from '../components/clarify'
import notesLogic from './notesLogic'
import NoteCard from '../components/noteCard'

function NotesList(props) {
    const location = useLocation()
    const path = location.pathname.slice(1)
    const {t} = useTranslation()

    const {setOfflineMode, notes, setNotes, online} = appStore()
    
    const [offline, setOffline] = useState(Cookies.get('offline') == 'true')

    const {
        action, notesError,
        notesLoading,
        notesMessage,
    } = clarifyStore()

    const {
        elementID,
        setElementID,
        getNotes,
        openAnim,
        queryString,
        filteredNotes,
        loadMore,
        page,
        lastPage,
        loadMoreText
    } = notesLogic(props)

    const handleAction = (type, id) => {
        setElementID(id)
        openAnim(type)
    }

    // displaying a sorted list
    const renderNotes = useMemo(() => {
        // const source = queryString ? filteredNotes : notes
        const source = notes
        return source?.map((element, index) =>
            <motion.div
                key={element.id}
                className='note-animated-element'
                layout
            >
                <NoteCard
                    note={element}
                    onAction={handleAction}
                    setCategory={props.setCategory}
                    setTag={props.setTag}
                />
            </motion.div>
        )
    }, [queryString, filteredNotes, notes, handleAction])

    return(
        <>
            <SlideDown
                visibility={notesError}
            >
                <div
                    className='groups-loading-error'
                    onClick={() => {
                        online ? turnOnlineMode() : setOfflineMode(true)
                    }}
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
                                {t(notesMessage)}
                            </span>
                        </div>
                    </div>
                    <SlideDown
                        visibility={notesError && online}
                    >
                        <div
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
                        </div>
                    </SlideDown>
                    <SlideDown
                        visibility={!online && notesError}
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
                        <label
                            className='newnote-offline-mode'
                            onClick={e => e.stopPropagation()}
                        >
                            <div
                                className='settings-offline-title'
                            >
                                {t('Auto switch to offline mode')}
                            </div>
                            <div
                                className='settings-offline-checkbox'
                            >
                                <input
                                    type='checkbox'
                                    className='settings-offline-techbox'
                                    checked={offline}
                                    onChange={e => {
                                        setOffline(e.target.checked)
                                        Cookies.set('offline', e.target.checked, {expires: 1})
                                    }}
                                />
                                <FontAwesomeIcon
                                    icon={faPlaneCircleCheck}
                                    className='settings-offline-logo'
                                />
                            </div>
                        </label>
                    </SlideDown>
                </div>
            </SlideDown>
            <SlideDown
                visibility={!notesLoading}
            >
                <motion.div layout className='notes-list'>
                    <AnimatePresence>
                        {renderNotes}
                    </AnimatePresence>
                    <SlideDown
                        visibility={page < lastPage}
                    >
                        <div
                            onClick={loadMore}
                            className='load-more-button'
                        >
                            <span
                                key={loadMoreText}
                                className='load-more-text'
                            >
                                {t(loadMoreText)}
                            </span>
                            <span
                                className='load-more-dots'
                                style={{opacity: loadMoreText == 'Load more' ? 0 : 1}}
                            >
                                <i></i><i></i><i></i>
                            </span>
                        </div>
                    </SlideDown>
                </motion.div>
            </SlideDown>
            {action ?
                <Clarify
                    id={elementID}
                    setID={setElementID}
                    getNotes={getNotes}
                    setNotes={setNotes}
                />
            : null}
            <SlideDown
                visibility={notesLoading}
            >
                <div
                    className='notes-list'
                >
                    <ContentLoader
                        className='note-element'
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
                        {/* title */}
                        <rect x='5' y='5' rx='4' ry='4' width='200' height='20'/>
                        {/* desc */}
                        <rect x='5' y='34' rx='3' ry='3' width='260' height='25'/>
                        {/* tags */}
                        <rect x='5' y='70' rx='3' ry='3' width='70' height='20'/>
                        <rect x='85' y='70' rx='3' ry='3' width='50' height='20'/>
                        <rect x='145' y='70' rx='3' ry='3' width='50' height='20'/>
                        {/* date */}
                        <rect x='225' y='71' rx='3' ry='3' width='40' height='18'/>
                    </ContentLoader>
                </div>
            </SlideDown>
        </>
    )
}

export default NotesList