import './note.css'

import {useState, useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {Link, useNavigate, useLocation, useParams} from 'react-router'
import MDEditor from '@uiw/react-md-editor'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowUp as faArrowUpSolid, faPenToSquare, faTriangleExclamation, faSpinner, faPlane, faShareNodes, faBoxArchive, faTrash} from '@fortawesome/free-solid-svg-icons'

import Share from '../components/share'
import Clarify from '../components/clarify'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'

import {clarifyStore, editorStore, appStore} from '../store'

function Note() {

    const location = useLocation()
    const {id} = useParams()
    const {offlineMode, online, noteInfo, setNoteInfo} = appStore()

    // checks for the presence of a token in cookies and local storage
    const token = [localStorage.getItem('token'), Cookies.get('token')]
        .find(
            token => token
        &&
            token !== 'null'
    )

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const getNote = () => {
    fetch(`http://api.notevault.pro/api/v1/notes/${location.state || id}`, {
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
        },
    })
        .then(res => {
            if (!res.ok) throw new Error(res.statusText)
            return res.json()
        })
        .then(resData => {
            setNoteInfo(resData)
            setLoading(false)
        })
        .catch(() => setError(true))
    }

    // triggers the function execution on the first load
    useEffect(() => online ? getNote() : setLoading(false), [])

    const {action, setAction, setVisibility} = clarifyStore()

    const {act, setAct, setVisible} = editorStore()

    const navigate = useNavigate()
    const {t, i18n} = useTranslation()

    //

    // list of buttons and their icons
    const buttons = useMemo(() => [{
            name: 'edit',
            icon: faPenToSquare
        },{
            name: 'share',
            icon: faShareNodes,
            disabled: true
        },{
            name: 'archive',
            icon: faBoxArchive
        },{
            name: 'delete',
            icon: faTrash
        }], [])

    // display buttons
    const renderButtons = useMemo(() => 
        buttons.map((element, index) =>
        <button
            disabled={element?.disabled}
            to={element.name}
            className='note-button'
            key={index}
            // disabled={visibility || visible}
            onClick={() => {
                const actions = {
                    archive: () => {
                                setAction('archive')
                                setTimeout(() => {
                                    setVisibility(true)
                                }, 1)},
                    delete: () => {
                                setAction('delete')
                                setTimeout(() => {
                                    setVisibility(true)
                                }, 1)},
                    share: () => {
                                setAct(true)
                                setTimeout(() => {
                                    setVisible(true)
                                }, 1)},
                    edit: () => navigate(
                        `../notes/edit/${location.state}`, {
                            state: location.state
                        }
                    ),
                }
                actions[element.name]?.()
            }}
            // ternary operator checks the link, and if it is a delete link, it outputs the color for the delete button and its hover
            style={element.name == 'delete' ? {
                '--btn-bg': 'var(--del-btn)',
                '--btn-bg-hvr': 'var(--del-btn-hvr)'
            }:{
                '--btn-bg': 'var(--blck-bc)',
                '--btn-bg-hvr': 'var(--blck-bc-hvr)'
            }}
        >
            <FontAwesomeIcon
                className='note-button-icon'
                icon={element.icon}
            />
            {element.name}
        </button>
        ), 
        [buttons, setAction, setVisibility, setAct, setVisible, navigate, location]
    )

    //

    const renderTags = useMemo(() => 
        noteInfo.tags?.map((element, index) =>
        <Link
            to='/notes'
            className='note-info-tag'
            state={{
                sort: 'tag',
                value: element.name
            }}
            key={index}
        >
            #{t(element.name)}
        </Link>
        ), 
        [noteInfo.tags, t]
    )

    return (
        <div
            className='note-main'
        >
            {/* HEADER */}
                <div
                    className='note-header'
                >
                    <div
                        className='newnote-top'
                    >
                        <Link
                            className='back-notes'
                            to='../notes'
                        >
                            <FontAwesomeIcon
                                className='title-arrow'
                                icon={faArrowUpSolid}
                            />
                            {t('Back to notes')}
                        </Link>
                        <SlideLeft
                            visibility={error}
                        >
                            <FontAwesomeIcon
                                className='newnote-loading-error'
                                icon={faTriangleExclamation}
                                tabIndex='0'
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={loading}
                        >
                            <FontAwesomeIcon
                                className='newnote-loading-icon'
                                icon={faSpinner}
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={offlineMode}
                        >
                            <FontAwesomeIcon
                                className='newnote-offline-icon'
                                icon={faPlane}
                            />
                        </SlideLeft>
                    </div>
                    <div
                        className='note-button-group'
                    >
                        {renderButtons}
                    </div>
                </div>
                {/* NOTE */}
                
                <div
                    className='note-info'
                >
                    <SlideDown
                        visibility={!loading}
                    >
                        <div
                            className='note-info-title'
                        >
                            {t(noteInfo.title)}
                        </div>
                        <div
                            className='note-info-dates'
                        >
                            <div
                                className='note-info-created'
                            >
                                {t('Created')}: {new Date(noteInfo.created_at).toLocaleDateString(i18n.language, {
                                    month: 'short', day: 'numeric', year: 'numeric'})}
                            </div>
                            <div
                                className='note-info-circle'
                            />
                            <div
                                className='note-info-updated'
                            >
                                {t('Updated')}: {new Date(noteInfo.updated_at).toLocaleDateString(i18n.language, {
                                    month: 'short', day: 'numeric', year: 'numeric'})}
                            </div>
                        </div>
                        <div
                            className='note-info-groups'
                        >
                            {noteInfo.category !== null ?
                                <div
                                    className='note-info-categories'
                                >
                                    <Link
                                        to='/notes'
                                        className='note-info-category'
                                        style={{'--cat-color': noteInfo.category?.color}}
                                        state={{
                                            sort: 'category',
                                            value: noteInfo.category?.name
                                        }}
                                    >
                                        <div
                                            className='info-category-circle'
                                        />
                                        {t(noteInfo.category?.name)}
                                    </Link>
                                </div>
                            : null}
                            <div
                                className='note-info-tags'
                            >
                                {renderTags}
                            </div>
                        </div>
                        {noteInfo.is_markdown ? 
                            <MDEditor.Markdown
                                source={noteInfo.content}
                            />
                        : 
                            <div
                                className='note-info-content'
                            >
                                {noteInfo.content}
                            </div>
                        }
                    </SlideDown>
                </div>
                {/* SHARE WINDOW */}
                {act ? <Share id={location.state}/> : null}
                {/* CLARIFICATION WINDOWS */}
                {action ? <Clarify id={location.state}/> : null}
        </div>
    )
}

export default Note