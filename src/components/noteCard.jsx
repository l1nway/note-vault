import '../notes/notesList.css'

import {useMemo} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Link, useLocation} from 'react-router'
import MDEditor from '@uiw/react-md-editor'
import {useTranslation} from 'react-i18next'

import {faTrashCanArrowUp, faTrash as faTrashSolid, faBoxArchive as faBoxArchiveSolid, faFloppyDisk, faTriangleExclamation, faTrashCan, faBoxOpen, faServer, faTowerBroadcast} from '@fortawesome/free-solid-svg-icons'

import {clarifyStore, notesViewStore, pendingStore, appStore} from '../store'

import SlideLeft from '../components/slideLeft'
import SlideDown from './slideDown'

function noteCard({note, onAction, setCategory, setTag}) {
    const location = useLocation()
    const path = location.pathname.slice(1)
    const {t, i18n} = useTranslation()
    const {setNoteInfo, notes} = appStore()
    
    const {undo, pendings} = pendingStore()

    const pending = useMemo(() => pendings.find(p => p.id == note.id), [pendings, note.id])
    const isPending = useMemo(() => Boolean(pending), [pending])

    const pendingAction = useMemo(() => pending?.action, [pending])

    const {retryFunction} = clarifyStore()
    const {notesView} = notesViewStore()

    const allActions = useMemo(() => ({
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
    }))

    const renderButtons = useMemo(() => 
        allActions[path]?.map((action, index) => (
            <FontAwesomeIcon
                key={action.type}
                icon={action.icon}
                className={index == 0 ? 'button-archive' : 'button-delete'}
                tabIndex='0'
                onClick={e => {
                    e.preventDefault()
                    if (isPending) return
                    onAction(action.type, note.id)
                }}
            />
    )))

    const renderTags = useMemo(() => 
        note.tags?.map((tagElement, index) => (
            <div
                key={index}
                className='note-tag'
                onClick={(e) => {
                    e.preventDefault()
                    setTag(tagElement)
                }}
            >
                {tagElement.name}
            </div>
    )))

    return (
        <Link
            className={`note-element${
                isPending
                    ? pendingAction == 'archive'
                        ? ' --archiving'
                        : ' --disappearance'
                    : ''
            }`}
            state={note.id}
            to={`note/${note.id}`}
            onClick={(e) => {
                if (isPending || path != 'notes') {
                    e.preventDefault()
                    undo(pending.pendingId)
                    return
                } else {
                    setNoteInfo(notes.find(n => n.id == note.id))
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
            <SlideDown
                visibility={!isPending}
            >
                <div
                    className='note-buttons'
                >
                    {renderButtons}
                </div>
            </SlideDown>
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
                        <SlideLeft
                            visibility={note.saving}
                        >
                            <FontAwesomeIcon
                                className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                                icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={note.error}
                        >
                            <FontAwesomeIcon
                                className='loading-error-icon'
                                icon={faTriangleExclamation}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setElementID(note.id)
                                    // openAnim()
                                    // setName()
                                    // setColor()
                                }}
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={isPending}
                        >
                            <FontAwesomeIcon
                                className='loading-save-icon --restore'
                                icon={
                                    pendingAction == 'archive'
                                        ? faBoxOpen
                                        : faTrashCanArrowUp
                                }
                                onClick={(e) => {
                                    e.preventDefault()
                                    undo(pending?.pendingId)
                                }}
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={note.offline}
                        >
                            <FontAwesomeIcon
                                className='note-offline-icon'
                                icon={faServer}
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={note.syncing}
                        >
                            <FontAwesomeIcon
                                className='note-offline-icon'
                                icon={faTowerBroadcast}
                            />
                        </SlideLeft>
                    </div>
                    {note.is_markdown ? 
                        <MDEditor.Markdown
                            source={note.content}
                        />
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
                        {note.category ? 
                            <div
                                className='note-category'
                                style={{backgroundColor: note.category.color}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setCategory(note.category)
                                }}
                            >
                                <div
                                    className='category-circle'
                                />
                                <div
                                    className='category-text'
                                >
                                    {t(note.category?.name)}
                                </div>
                            </div>
                        : null}
                        {note.tags ?
                            <div
                                className='note-tags'
                            >
                                {renderTags}
                            </div>
                        : null}
                    </div>
                    <div
                        className='note-date'
                    >
                        {new Date(note.created_at).toLocaleDateString(i18n.language, {month: 'short', day: 'numeric'})}
                    </div>
                </div>
            </div>
        </Link>
    )}

export default noteCard