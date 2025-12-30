import '../notes/notesList.css'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Link, useLocation} from 'react-router'
import MDEditor from '@uiw/react-md-editor'
import {useTranslation} from 'react-i18next'

import {faTrashCanArrowUp, faTrash as faTrashSolid, faBoxArchive as faBoxArchiveSolid, faFloppyDisk, faTriangleExclamation, faTrashCan, faBoxOpen, faServer, faTowerBroadcast} from '@fortawesome/free-solid-svg-icons'

import {clarifyStore, notesViewStore, pendingStore} from '../store'

import SlideLeft from '../components/slideLeft'
import SlideDown from './slideDown'

function noteCard({note, onAction}) {
    const location = useLocation()
    const path = location.pathname.slice(1)
    const {t, i18n} = useTranslation()
    
    const {undo, pendings} = pendingStore()

    const isPending = pendings.some(p => p.id == note.id)
    const pendingAction = pendings.find(p => p.id == note.id)?.action

    const {savings, savingErrors, retryFunction} = clarifyStore()
    const {notesView} = notesViewStore()

    const allActions = {
        notes: [
            {type: 'archive', icon: faBoxArchiveSolid},
            {type: 'delete', icon: faTrashSolid}
        ],
        archive: [
            {type: 'unarchive', icon: faBoxOpen},
            {type: 'delete', icon: faTrashSolid}
        ],
        trash: [
            {type: 'restore', icon: faTrashCanArrowUp},
            {type: 'force', icon: faTrashSolid}
    ]}

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
                    undo(note.id)
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
                    {allActions[path].map((action, index) => (
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
                    ))}
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
                            visibility={savings[note.id]}
                        >
                            <FontAwesomeIcon
                                className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                                icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={savingErrors[note.id] || note.id.error}
                        >
                            <FontAwesomeIcon
                                className='loading-error-icon'
                                icon={faTriangleExclamation}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setElementID(note.id)
                                    openAnim(savingErrors[note.id].action)
                                    setName(savingErrors[note.id].name)
                                    setColor(savingErrors[note.id].color)
                                }}
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={pendings.some(p => p.id == note.id)}
                        >
                            <FontAwesomeIcon
                                className='loading-save-icon --restore'
                                icon={
                                    pendings?.find(
                                        p => p.id == note.id
                                    )?.action == 'archive'
                                        ? faBoxOpen
                                        : faTrashCanArrowUp
                                    }
                                onClick={(e) => {
                                    e.preventDefault()
                                    undo(note.id)
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
                                    setNotesLoading(true)
                                    props.setCategory(note.category)
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
                                {note.tags?.map((tagElement, index) => (
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
                        {new Date(note.created_at).toLocaleDateString(i18n.language, {month: 'short', day: 'numeric'})}
                    </div>
                </div>
            </div>
        </Link>
    )}

export default noteCard