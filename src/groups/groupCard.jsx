import './groups.css'

import {useMemo} from 'react'
import {useLocation, Link} from 'react-router'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTowerBroadcast, faServer, faPenToSquare, faTrash as faTrashSolid, faTag, faFloppyDisk, faTriangleExclamation, faTrashCan, faTrashCanArrowUp} from '@fortawesome/free-solid-svg-icons'

import SlideLeft from '../components/slideLeft'
import SlideDown from '../components/slideDown'
import groupsLogic from './groupsLogic'

import {clarifyStore, pendingStore} from '../store'

function GroupCard({element, openAnim, setElementID, setName, setColor}) {
    const {pathname} = useLocation()
    const path = pathname.slice(1)

    const {animating, savings, savingErrors, retryFunction} = clarifyStore()
    const {undo, pendings} = pendingStore()
    
    const {catsView, setCatsView} = groupsLogic()
    
    const pending = useMemo(
        () => pendings.find(p => p.id == element.id),
        [pendings, element.id]
    )

    const isPending = Boolean(pending)
    return (
        <Link
            to='/notes'
            className={`group-element ${isPending
                ? '--disappearance'
                : ''
            }`}
            key={element.id}
            state={{
                sort: path,
                value: element
            }}
            onClick={e => {
                if (isPending) {
                    e.preventDefault()
                    undo(pending.pendingId)
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
            <SlideDown
                visibility={!isPending}
            >
                <div
                    className='group-buttons'
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
            </SlideDown>
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
                            : (path == 'tags' ? `#${element.name}` : element.name)
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
                        visibility={isPending}
                    >
                        <FontAwesomeIcon
                            className='loading-save-icon --restore'
                            icon={faTrashCanArrowUp}
                            onClick={(e) => {
                                e.preventDefault()
                                undo(pending.pendingId)
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
                <div
                    className='group-amount'
                >
                    {element.notes_count} notes
                </div>
            </div>
        </Link>
    )
}

export default GroupCard