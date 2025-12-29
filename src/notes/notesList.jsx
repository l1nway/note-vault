import './notesList.css'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useMemo} from 'react'
import ContentLoader from 'react-content-loader'
import {Link, useLocation} from 'react-router'
import MDEditor from '@uiw/react-md-editor'
import {useTranslation} from 'react-i18next'

import {faBoxArchive as faBoxArchiveSolid, faTrash as faTrashSolid, faFloppyDisk, faTriangleExclamation, faRotateRight, faTrashCan, faTrashCanArrowUp, faBoxOpen, faSignal, faServer, faTowerBroadcast} from '@fortawesome/free-solid-svg-icons'

import {appStore, clarifyStore, notesViewStore, pendingStore} from '../store'

import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import Clarify from '../components/clarify'
import notesLogic from './notesLogic'

function NotesList(props) {
    const location = useLocation()
    const path = location.pathname.slice(1)
    const {t, i18n} = useTranslation()

    const {setOfflineMode, notes, setNotes, online} = appStore()

    const {undo, pendings} = pendingStore()

    // global state that stores the display view of notes
    const {notesView} = notesViewStore()

    const {
        action, notesError,
        notesLoading, setNotesLoading,
        notesMessage,
        savings,
        savingErrors,
        retryFunction
    } = clarifyStore()

    const {
        elementID,
        setElementID,
        getNotes,
        openAnim,
        queryString,
        filteredNotes
    } = notesLogic(props)

    // displaying a sorted list
    const renderNotes = useMemo(() => {
        const source = queryString ? filteredNotes : notes
        return source?.map((element, index) =>
            <Link
                key={index}
                className={`note-element${
                    pendings.find(p => p.id == element.id)
                        ? pendings.find(p => p.id == element.id).action == 'archive'
                            ? ' --archiving'
                            : ' --disappearance'
                        : ''
                }`}
                state={element.id}
                to={`note/${element.id}`}
                onClick={(e) => {
                    if (pendings.some(p => p.id == element.id)) {
                        e.preventDefault()
                        undo(element.id)
                    }
                }}
            >
                {/* input for css only */}
                <input
                    type='checkbox'
                    className='list-view'
                    checked={notesView == 'list'}
                    readOnly
                />
                <div
                    className='note-buttons'
                >
                    <FontAwesomeIcon
                        tabIndex='0'
                        className='button-archive'
                        onClick={(e) => {
                            e.preventDefault()
                            openAnim('archive')
                            setElementID(element.id)
                        }}
                        icon={faBoxArchiveSolid}
                    />
                    <FontAwesomeIcon
                        tabIndex='0'
                        className='button-delete'
                        onClick={(e) => {
                            e.preventDefault()
                            openAnim('delete')
                            setElementID(element.id)
                        }}
                        icon={faTrashSolid}
                    />
                </div>
                <div
                    className='note-content'
                >
                    <div
                        className='note-top-group'
                    >
                        <div
                            className='note-title-top'
                        >
                            <h2
                                className='note-title'
                            >
                                {t(element.title)}
                            </h2>
                            <SlideLeft
                                visibility={savings[element.id]}
                            >
                                <FontAwesomeIcon
                                    className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                                    icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                                />
                            </SlideLeft>
                            <SlideLeft
                                visibility={savingErrors[element.id] || element.id.error}
                            >
                                <FontAwesomeIcon
                                    className='loading-error-icon'
                                    icon={faTriangleExclamation}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setElementID(element.id)
                                        openAnim(savingErrors[element.id].action)
                                        setName(savingErrors[element.id].name)
                                        setColor(savingErrors[element.id].color)
                                    }}
                                />
                            </SlideLeft>
                            <SlideLeft
                                visibility={pendings.some(p => p.id == element.id)}
                            >
                                <FontAwesomeIcon
                                    className='loading-save-icon --restore'
                                    icon={
                                        pendings?.find(
                                            p => p.id == element.id
                                        )?.action == 'archive'
                                            ? faBoxOpen
                                            : faTrashCanArrowUp
                                        }
                                    onClick={(e) => {
                                        e.preventDefault()
                                        undo(element.id)
                                    }}
                                />
                            </SlideLeft>
                            <SlideLeft
                                visibility={element.offline}
                            >
                                <FontAwesomeIcon
                                    className='note-offline-icon'
                                    icon={faServer}
                                />
                            </SlideLeft>
                            <SlideLeft
                                visibility={element.syncing}
                            >
                                <FontAwesomeIcon
                                    className='note-offline-icon'
                                    icon={faTowerBroadcast}
                                />
                            </SlideLeft>
                        </div>
                        {element.is_markdown ? 
                            <MDEditor.Markdown
                                source={element.content}
                            />
                            : 
                            <p
                                className='note-desc'
                            >
                                {t(element.content)}
                            </p>
                        }
                    </div>
                    <div
                        className='note-bottom-group'
                    >
                        <div
                            className='note-cats'
                        >
                            {element.category ? 
                                <div
                                    className='note-category'
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setNotesLoading(true)
                                        props.setCategory(element.category)
                                    }}
                                >
                                    <div
                                        className='category-circle'
                                    />
                                    <div
                                        className='category-text'
                                    >
                                        {t(element.category?.name)}
                                    </div>
                                </div>
                            : null}
                            {element.tags ?
                                <div
                                    className='note-tags'
                                >
                                    {element.tags?.map((tagElement, index) => (
                                        <div
                                            key={index}
                                            className='note-tag'
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setNotesLoading(true)
                                                props.setTag(tagElement)
                                            }}
                                        >
                                            {tagElement.name}
                                        </div>
                                    ))}
                                </div>
                            : null}
                        </div>
                        <div
                            className='note-date'
                        >
                            {new Date(element.created_at).toLocaleDateString(i18n.language, {month: 'short', day: 'numeric'})}
                        </div>
                    </div>
                </div>
            </Link>
    )})

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
                    </SlideDown>
                </div>
            </SlideDown>
            <SlideDown
                visibility={!notesLoading}
            >
                <div
                    className='notes-list'
                >
                    
                    {renderNotes}
                </div>
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