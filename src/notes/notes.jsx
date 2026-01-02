import './notes.css'

import {useState, useEffect, useRef, useCallback, useMemo} from 'react'
import {Link, useLocation} from 'react-router'
import {useTranslation} from 'react-i18next'

import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlane, faSpinner, faTrashCan, faTriangleExclamation, faMagnifyingGlass as faMagnifyingGlassSolid, faUserSlash, faArrowUp as faArrowUpSolid, faTableCells as faTableCellsSolid, faList as faListSolid, faXmark, faFloppyDisk} from '@fortawesome/free-solid-svg-icons'

import NotesList from './notesList'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import Options from '../components/options'
import useSelect from '../components/useSelect'
import Hotkey from '../components/hotkey'

import {apiStore, appStore, clarifyStore, notesViewStore} from '../store'

// Managing notes page header
function Notes() {
    // 
    const online = apiStore(state => state.online)
    const {offlineMode, setOfflineMode} = appStore()
    
    const location = useLocation()
    const path = location.pathname.slice(1)

    const token = [
            localStorage.getItem('token'),
            Cookies.get('token')
        ].find(
                token => token
            &&
                token !== 'null'
        )

    const searchRef = useRef()

    const [searchFocus, setSearchFocus] = useState(false)

    const focusSearch = useCallback(() => {
        searchRef.current?.focus()
    }, [])

    const getTags = () => {
        fetch(`http://api.notevault.pro/api/v1/tags`,
            {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    authorization: 
                        `Bearer ${token}`
                }
            })
        .then(res => res.json())
        .then(resData => (setTags(resData)))
    }

    const getCats = () => {
        fetch(`http://api.notevault.pro/api/v1/categories`,
            {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    authorization: 
                        `Bearer ${token}`
                }
            })
        .then(res => res.json())
        .then(resData => (setCategories(resData)))
    }

    useEffect(() => {
        if (token) {
            getTags()
            getCats()
        }
    }, [])

    const categoryRef = useRef(null)
    const tagRef = useRef(null)

    const categoryHeadRef  = useRef(null)
    const tagHeadRef = useRef(null)

    const [categoryMaxWidth, setCategoryMaxWidth] = useState('0px')
    const [tagMaxWidth, setTagMaxWidth] = useState('0px')

    const {
        setNotesError, notesError,
        setAction,
        setVisibility,
        animating, setAnimating,
        notesLoading, setNotesLoading,
        notesMessage,
        savings,
        savingErrors,
        setClarifyLoading,
        retryFunction, setRetryFunction
    } = clarifyStore()

    const {t} = useTranslation()

    //

    // global state that stores the display view of notes
    const {notesView, setNotesView} = notesViewStore()

    // сonverts values ​​to true or false; for convenience (reducing unnecessary code with tags)
    const listView = notesView == 'list'

    //

    // state for storing information from search input
    const [search, setSearch] = useState('')

    //

    // array with all categories (SERVER)
    const [categories, setCategories] = useState([])

    // selector open status
    const [categoryStatus, setCategoryStatus] = useState(false)

    // selector value
    const [categoryValue, setCategoryValue] = useState(
        // checks for the presence of an input parameter (if you click on a specific category)
            location.state?.sort == 'categories'
        ?
            location.state.value
        :
            'All categories'
    )

    useEffect(() => {
        if (categoryHeadRef.current) {
            const width = categoryHeadRef.current.scrollWidth
            requestAnimationFrame(() => setCategoryMaxWidth(width))
        }
    }, [categoryValue])

    // render list of options
    const renderCategories = useMemo(() => 
        categories?.map((element, index) => 
            <div
                key={index}
                tabIndex='0'
                className='select-option'
                onClick={() => {
                    setCategoryValue(element)
                    setNotesLoading(true)
                }}
                onKeyDown={(e) => {
                    if (e.key == 'Enter') {
                        setCategoryValue(element)
                        setCategoryStatus(false)
                    }
                }}
            >
                {t(element.name)}
            </div>
        ), 
        [categories, t, setCategoryValue, setNotesLoading, setCategoryStatus]
    )

    // array with all tags (SERVER)
    const [tags, setTags] = useState([])

    // selector open status
    const [tagStatus, setTagStatus] = useState(false)

    // selector value
    const [tagValue, setTagValue] = useState(
        // checks for the presence of an input parameter (if you click on a specific tag)
            location.state?.sort == 'tags'
        ?
            location.state.value
        :
            'All tags'
    )

    useEffect(() => {
        if (tagHeadRef.current) {
            const width = tagHeadRef.current.scrollWidth
            requestAnimationFrame(() => setTagMaxWidth(width))
        }
    }, [tagValue])

    // render list of options
    const renderTags = useMemo(() => 
        tags?.map((element, index) =>
            <div
                key={index}
                tabIndex='0'
                className='select-option'
                onClick={() => {
                    setTagValue(element),
                    setNotesLoading(true)
                }}
            >
                #{t(element.name)}
            </div>
        ), 
        [tags, t, setTagValue, setNotesLoading]
    )

    //

    // refs for correctly setting focus on the checkbox imitation
    const gridRef = useRef(null)
    const listRef = useRef(null)

    //
    
    // ref is used to prevent a bug where focus is set on first load
    const firstRender = useRef(true)

    // array view monitored for changes, then the focus is set to the selected option
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false
            return
        }

        notesView == 'list' ? listRef.current?.focus() : gridRef.current?.focus()
    }, [notesView])

    //

    const table = useMemo(() => ['title & description', 'categories, tags, date & deletion and archiving'], [])

    const renderTable = useMemo(() => 
        table.map((element, index) => 
            <div
                key={index}
            >
                {t(element)}
            </div>
        ), 
        [table, t]
    )

    const openAnim = (action) => {
        if (animating == true) {
            return false
        }
        setAnimating(true)
        setAction(action)
        setRetryFunction(action)
        setClarifyLoading(true)

        setTimeout(() => {
            setVisibility(true)
        }, 10)

        setTimeout(() => {
            setAnimating(false)
        }, 300)
    }

    const categorySelect = useSelect({
        disabled: notesError,
        isOpen: categoryStatus,
        setIsOpen: setCategoryStatus
    })

    const tagSelect = useSelect({
        disabled: notesError,
        isOpen: tagStatus,
        setIsOpen: setTagStatus
    })

    const hotkeys = useMemo(() => [{
        key: 'mod+k',
        trigger: focusSearch
    },{
        key: 'esc',
        trigger: () => searchRef.current?.blur(),
        enabled: searchFocus
    },{
        key: 'c',
        trigger: () => {
            setCategoryStatus(!categoryStatus)
            categoryRef.current?.focus()
        },
        enabled: !searchFocus
    },{
        key: 'alt+c, shift+c',
        trigger: () => {
            setCategoryStatus(!categoryStatus)
            categoryRef.current?.focus()
        }
    },{
        key: 't',
        trigger: () => {
            setTagStatus(!tagStatus)
            tagRef.current?.focus()
        },
        enabled: !searchFocus
    },{
        key: 'alt+t, shift+3, shift+t',
        trigger: () => {
            setTagStatus(!tagStatus)
            tagRef.current?.focus()
        }
    },{
        key: 'v',
        trigger: () => setNotesView(prev => (prev == 'list' ? 'grid' : 'list')),
        enabled: !searchFocus
    },{
        key: 'alt+v, shift+v',
        trigger: () => setNotesView(prev => (prev == 'list' ? 'grid' : 'list'))
    },{
        key: 'g',
        trigger: () => setNotesView('grid'),
        enabled: !searchFocus
    },{
        key: 'l',
        trigger: () => setNotesView('list'),
        enabled: !searchFocus
    },{
        key: 'mod+2, alt+2, shift+2',
        trigger: () => setNotesView('grid')
    },{
        key: 'mod+1, alt+1, shift+1',
        trigger: () => setNotesView('list')
    }], [focusSearch, searchFocus, categoryStatus, tagStatus, setCategoryStatus, setTagStatus, setNotesView])

    const renderHotkeys = useMemo(() => 
        hotkeys.map((element, index) =>
            <Hotkey
                key={index}
                keys={element.key}
                onTrigger={element.trigger}
                enabled={element.enabled}
            />
        ), 
        [hotkeys]
    )

    return(
        <div
            className='notes-main'
        >
            {/* header  */}
            <div
                className='notes-top'
            >
                <div
                    className='notes-top-group'
                >
                    <h1
                        className='notes-title'
                        title='браузерная подсказка'
                    >
                        {t('All notes')}
                    </h1>
                    {/* displayed during loading */}
                    <SlideLeft
                        visibility={notesLoading}
                    >
                        <FontAwesomeIcon
                            className='clarify-loading-icon'
                            icon={faSpinner}
                        />
                    </SlideLeft>
                    {/* displayed during saving */}
                    <SlideLeft
                        visibility={savings[path]}
                    >
                        <FontAwesomeIcon
                            className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                            icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                        />
                    </SlideLeft>
                    {/* displayed only if the server returned an error */}
                    <SlideLeft
                        visibility={savingErrors[path] || notesError}
                    >
                        <FontAwesomeIcon
                            className='loading-error-icon'
                            icon={faTriangleExclamation}
                            onClick={() => openAnim(retryFunction)}
                        />
                    </SlideLeft>
                    {/*  */}
                    <SlideLeft
                        visibility={!savingErrors}
                    >
                        <span
                            className='notes-error-text'
                        >
                            {t(notesMessage)}
                        </span>
                    </SlideLeft>
                    {/* displayed only if offline mode is enabled */}
                    <SlideLeft
                        visibility={offlineMode}
                    >
                        <FontAwesomeIcon
                            className='newnote-offline-icon'
                            icon={faPlane}
                        />
                    </SlideLeft>
                    {/* displayed only if the user is not authorized */}
                    <SlideLeft
                        visibility={!token}
                    >
                        <FontAwesomeIcon
                            className='unauthorized-user-icon'
                            icon={faUserSlash}
                        />
                    </SlideLeft>
                </div>
                <Link
                    to='new'
                    className={`notes-new ${(!online && !offlineMode) && '--new-disabled'}`}
                    onClick={(e) => (!online && !offlineMode) && e.preventDefault()}
                >
                    + {t('New note')}
                </Link>
            </div>
            {/* settings */}
            <div
                className='search-settings'
            >
                <label
                    className={`input-group ${(notesError) && '--disabled'}`}
                >
                    <FontAwesomeIcon
                        className='search-icon'
                        icon={faMagnifyingGlassSolid}
                    />
                    <input
                        placeholder={t('Search in all notes…')}
                        ref={searchRef}
                        onFocus={() => setSearchFocus(true)}
                        onBlur={() => setSearchFocus(false)}
                        disabled={notesError}
                        className='search-input'
                        style={{cursor: notesError ? 'not-allowed' : 'pointer'}}
                        type='text'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                        <div
                            className='search-hotkeys'
                        >
                            <SlideLeft
                                visibility={!searchFocus}
                            >
                                <kbd>⌘</kbd>+<kbd>K</kbd>
                            </SlideLeft>
                        </div>
                </label>
                <label
                    className={`select-element ${(notesError) && '--disabled'}`}
                    tabIndex='0'
                    ref={categoryRef}
                    style={{maxWidth: categoryMaxWidth}}
                    onClick={(!online && !offlineMode) ? undefined : categorySelect.handleToggle}
                    onBlur={categorySelect.handleBlur}
                    onFocus={(!online && !offlineMode) ? undefined : categorySelect.handleFocus}
                    onKeyDown={(!online && !offlineMode) ? undefined : categorySelect.handleKeyDown}
                >
                    <p
                        className='select-head'
                        ref={categoryHeadRef}
                    >
                        {categoryValue?.name || t('All categories')}
                    </p>
                    <div
                        className='select-buttons'
                    >
                        <SlideLeft
                            visibility={categoryValue != 'All categories'}
                        >
                            <FontAwesomeIcon
                                className='cancel-select'
                                icon={faXmark}
                                onClick={() => {
                                    setCategoryValue('All categories'),
                                    setNotesLoading(true)
                                }}
                            />
                        </SlideLeft>
                        <FontAwesomeIcon
                            className='select-icon'
                            icon={faArrowUpSolid}
                            style={{
                                '--arrow-direction': categoryStatus ? '0deg' : '180deg'
                            }}
                        />
                    </div>
                    <Options
                        visibility={categoryStatus}
                        selectRef={categoryRef}
                    >
                        <div
                            className='select-list'
                            style={{
                                '--select-border': categoryStatus ? '0.1vw solid #2a2f38' : '0.1vw solid transparent',
                                '--select-background': categoryStatus ? '#1f1f1f' : 'transparent',
                                '--opacity': categoryStatus ? 1 : 0
                            }}
                        >
                            {renderCategories}
                        </div>
                    </Options>
                </label>
                
                <label
                    className={`select-element --mobile ${(notesError) && '--disabled'}`}
                    tabIndex='0'
                    ref={tagRef}
                    style={{maxWidth: tagMaxWidth}}
                    onClick={tagSelect.handleToggle}
                    onBlur={tagSelect.handleBlur}
                    onFocus={tagSelect.handleFocus}
                    onKeyDown={tagSelect.handleKeyDown}
                >
                    <p
                        className='select-head'
                        ref={tagHeadRef}
                    >
                        {tagValue?.name ? `#${t(tagValue.name)}` : t('All tags')}
                    </p>
                    <div
                        className='select-buttons'
                    >
                        <FontAwesomeIcon
                            className='cancel-select'
                            icon={faXmark}
                            tabIndex={tagValue != 'All tags' ? '0' : '1'}
                            onClick={() => {
                                setTagValue('All tags'),
                                setNotesLoading(true)
                            }}
                            style={{
                                '--opacity': tagValue != 'All tags' ? 1 : 0
                            }}
                        />
                        <FontAwesomeIcon
                            className='select-icon'
                            icon={faArrowUpSolid}
                            style={{
                                '--arrow-direction': tagStatus ? '0deg' : '180deg'
                            }}
                        />
                    </div>
                    <Options
                        visibility={tagStatus}
                        selectRef={tagRef}
                    >
                        <div
                            className='select-list'
                            style={{
                                '--select-border': tagStatus ? '0.1vw solid #2a2f38' : '0.1vw solid transparent',
                                '--select-background': tagStatus ? '#1f1f1f' : 'transparent',
                                '--opacity': tagStatus ? 1 : 0
                            }}
                        >
                            {renderTags}
                        </div>
                    </Options>
                </label>
                <label
                    className={`notes-view ${(notesError) && '--disabled'}`}
                >
                    <FontAwesomeIcon
                        tabIndex='0'
                        className={`view-icon ${(notesError) && '--blocked'}`}
                        icon={faTableCellsSolid}
                        ref={gridRef}
                    />
                    <FontAwesomeIcon
                        tabIndex='0'
                        className={`view-icon ${(notesError) && '--blocked'}`}
                        icon={faListSolid}
                        ref={listRef}
                    />
                    <input
                        readOnly
                        disabled={notesError}
                        type='checkbox'
                        checked={notesView == 'list'}
                        onChange={() => setNotesView(notesView == 'list' ? 'grid' : 'list')}
                    />
                </label>
            </div>
            {/* table */}
            <div>
                <SlideDown
                    visibility={listView}
                >
                    <div
                        className='notes-table'
                    >
                        {renderTable}
                    </div>
                </SlideDown>
            </div>
            {/* list */}
            <NotesList
                setCategory={setCategoryValue}
                setTag={setTagValue}
                category={categoryValue}
                tag={tagValue}
                search={search}
                setSearch={setSearch}
            />
            {renderHotkeys}
        </div>
    )
}

export default Notes