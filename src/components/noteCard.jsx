import '../notes/notesList.css'

import React, {useCallback, useMemo} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Link, useLocation} from 'react-router'
import {useTranslation} from 'react-i18next'
import {motion} from 'framer-motion'

import {faTrashCanArrowUp, faTrash as faTrashSolid, faBoxArchive as faBoxArchiveSolid, faFloppyDisk, faTriangleExclamation, faTrashCan, faBoxOpen, faServer, faTowerBroadcast} from '@fortawesome/free-solid-svg-icons'

import SlideLeft from '../components/slideLeft'
import {notesViewStore} from '../store'

const MarkdownPreview = React.lazy(() => import('./mdprev'))

const allActions = {
    notes: [
        {type: 'archive', icon: faBoxArchiveSolid},
        {type: 'delete', icon: faTrashSolid}
    ],
    archived: [
        {type: 'unarchive', icon: faBoxOpen},
        {type: 'delete', icon: faTrashSolid}
    ],
    trash: [
        {type: 'restore', icon: faTrashCanArrowUp},
        {type: 'force', icon: faTrashSolid}
    ]
}

const noteCard = React.memo(function NoteCard({note, onAction, setCategory, setTag, setNoteInfo, retryFunction}) {
    const location = useLocation()
    const path = location.pathname.slice(1)
    const {t, i18n} = useTranslation()

    const notesView = notesViewStore(
        state => state.notesView,
        (a, b) => a == b
    )

    const renderButtons = useMemo(() => 
        allActions[path]?.map((action, index) => (
            <FontAwesomeIcon
                key={action.type}
                icon={action.icon}
                className={index == 0 ? 'button-archive' : 'button-delete'}
                tabIndex='0'
                onClick={e => {
                    e.preventDefault()
                    onAction(action.type, note.id)
                }}
            />
    )), [path, onAction, note.id])

    const renderTags = useMemo(() => 
        note.tags?.map((tagElement, index) => (
            <div
                key={tagElement.id}
                className='note-tag'
                onClick={(e) => {
                    e.preventDefault()
                    setTag(tagElement)
                }}
            >
                {tagElement.name}
            </div>
    )), [note.tags])

    const StatusIcon = React.memo(({visible, icon, className, onClick}) => (
        <SlideLeft visibility={visible}>
            <FontAwesomeIcon
                className={className}
                icon={icon}
                onClick={onClick}
            />
        </SlideLeft>
    ))

    const click = useCallback((e) =>{
        if (path == 'trash' || path == 'archived') {
            e.preventDefault()
            return
        }
        setNoteInfo(note)
    })

    return (
        <motion.div
            tabIndex={0}
            className='note-animated-element'
            layout='position'
        >
            <Link
                tabIndex={-1}
                className='note-element'
                state={note.id}
                to={`note/${note.id}`}
                onClick={(e) => click(e)}
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
                    {renderButtons}
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
                                {t(note.title)}
                            </h2>
                            <StatusIcon
                                visible={note.saving}
                                className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                                icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                            />
                            <StatusIcon
                                visible={note.error}
                                className='loading-error-icon'
                                icon={faTriangleExclamation}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setElementID(note.id)
                                }}
                            />
                            <StatusIcon
                                visible={note.offline}
                                className='note-offline-icon'
                                icon={faServer}
                            />
                            <StatusIcon
                                visible={note.syncing}
                                className='note-offline-icon'
                                icon={faTowerBroadcast}
                            />
                        </div>
                        {note.is_markdown ?
                            <React.Suspense fallback={null}>
                                <MarkdownPreview content={note.content}/>
                            </React.Suspense>
                            : 
                            <p
                                className='note-desc'
                            >
                                {t(note.content)}
                            </p>
                        }
                    </div>
                    <div
                        className='note-bottom-group'
                    >
                        <div
                            className='note-cats'
                        >
                                <div
                                    className='note-category'
                                    style={{
                                        padding: note.category ? 'revert-layer' : 0,
                                        '--cat-color': note.category?.color
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setCategory(note.category)
                                    }}
                                >
                                    {note.category ? 
                                        <>
                                            <div
                                                className='category-circle'
                                            />
                                            <div
                                                className='category-text'
                                            >
                                                {t(note.category?.name)}
                                            </div>
                                        </> : null} 
                                </div>
                                <div
                                    className='note-tags'
                                    tabIndex={-1}
                                >
                                    {renderTags}
                                </div>
                        </div>
                        <div
                            className='note-date'
                        >
                            {new Date(note.created_at).toLocaleDateString(i18n.language, {month: 'short', day: 'numeric'})}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )})

export default noteCard