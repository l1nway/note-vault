import './notes.css'

import {useState, useEffect, useRef, useCallback, useMemo} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {Link} from 'react-router'
import {useTranslation} from 'react-i18next'

import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlane, faSpinner, faTrashCan, faTriangleExclamation, faMagnifyingGlass as faMagnifyingGlassSolid, faUserSlash, faArrowUp as faArrowUpSolid, faTableCells as faTableCellsSolid, faList as faListSolid, faXmark, faFloppyDisk} from '@fortawesome/free-solid-svg-icons'

import NotesList from './notesList'
import SlideLeft from '../components/slideLeft'
import Options from '../components/options'
import useSelect from '../components/useSelect'
import Hotkey from '../components/hotkey'

import {apiStore, appStore, clarifyStore, notesViewStore} from '../store'

function Notes() {
    const {t} = useTranslation()
    const token = useMemo(() => [localStorage.getItem('token'), Cookies.get('token')].find(t => t && t !== 'null'), [])
    // 
    const online = apiStore(state => state.online)

    const {offlineMode, notes, tags, categories, setTags, setCategories} = appStore(
        useShallow(state => ({
            offlineMode: state.offlineMode,
            notes: state.notes,
            tags: state.tags,
            categories: state.categories,
            setTags: state.setTags,
            setCategories: state.setCategories
    })))

    const {notesError, setAction, setVisibility, animating, setAnimating, notesLoading, notesMessage, setClarifyLoading, retryFunction, setRetryFunction, tag, setTag, category, setCategory, search, setSearch} = clarifyStore(
        useShallow(state => ({
            notesError: state.notesError,
            setAction: state.setAction,
            setVisibility: state.setVisibility,
            animating: state.animating,
            setAnimating: state.setAnimating,
            notesLoading: state.notesLoading,
            notesMessage: state.notesMessage,
            setClarifyLoading: state.setClarifyLoading,
            retryFunction: state.retryFunction,
            setRetryFunction: state.setRetryFunction,
            tag: state.tag,
            setTag: state.setTag,
            category: state.category,
            setCategory: state.setCategory,
            search: state.search,
            setSearch: state.setSearch
    })))

    const {notesView, setNotesView} = notesViewStore(
        useShallow(state => ({
            notesView: state.notesView,
            setNotesView: state.setNotesView
    })))

    // refs for correctly setting focus on the checkbox imitation
    const gridRef = useRef(null)
    const listRef = useRef(null)
    // ref is used to prevent a bug where focus is set on first load
    const firstRender = useRef(true)
    const searchRef = useRef()
    const categoryRef = useRef(null)
    const tagRef = useRef(null)
    const categoryHeadRef = useRef(null)
    const tagHeadRef = useRef(null)

    const [searchFocus, setSearchFocus] = useState(false)
    // selector open status
    const [categoryStatus, setCategoryStatus] = useState(false)
    const [tagStatus, setTagStatus] = useState(false)

    const focusSearch = useCallback(() => {
        searchRef.current?.focus()
    }, [])

    useEffect(() => {
        if (!token || !online) return
            const getTags = async () => {
                const res = await fetch(`http://api.notevault.pro/api/v1/tags`, {
                    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                setTags(data)
            }

            const getCats = async () => {
                const res = await fetch(`http://api.notevault.pro/api/v1/categories`, {
                    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                setCategories(data)
            }
        getTags()
        getCats()
    }, [token, online, setTags, setCategories])

    // render list of options
    const renderCategories = useMemo(() => 
        categories?.map((element, index) => 
            <div
                key={element.id}
                tabIndex='0'
                className='select-option'
                onClick={() => setCategory(element)}
                onKeyDown={(e) => {
                    if (e.key == 'Enter') {
                        setCategory(element)
                        setCategoryStatus(false)
                    }
                }}
            >
                {t(element.name)}
            </div>
        ), [categories])

    // render list of options
    const renderTags = useMemo(() => 
        tags?.map((element, index) =>
            <div
                key={element.id}
                tabIndex='0'
                className='select-option'
                onClick={() => setTag(element)}
            >
                #{t(element.name)}
            </div>
    ), [tags, t, setTag])

    //

    // array view monitored for changes, then the focus is set to the selected option
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false
            return
        }

        notesView == 'list' ? listRef.current?.focus() : gridRef.current?.focus()
    }, [notesView])

    //

    const openAnim = useCallback((action) => {
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
    }, [animating, setAnimating, setAction, setRetryFunction, setClarifyLoading, setVisibility])

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
    }], [focusSearch, searchFocus, setNotesView])

    const renderHotkeys = useMemo(() => 
        hotkeys.map((element, index) =>
            <Hotkey
                key={element.key}
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
                        visibility={notes?.some(item => item?.saving == true)}
                    >
                        <FontAwesomeIcon
                            className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                            icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                        />
                    </SlideLeft>
                    {/* displayed only if the server returned an error */}
                    <SlideLeft
                        visibility={notesError || notes?.some(item => item?.error == true)}
                    >
                        <FontAwesomeIcon
                            className='loading-error-icon'
                            icon={faTriangleExclamation}
                            onClick={() => openAnim(retryFunction)}
                        />
                    </SlideLeft>
                    {/*  */}
                    <SlideLeft
                        visibility={false}
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
                    // style={{maxWidth: categoryMaxWidth}}
                    onClick={(!online && !offlineMode) ? undefined : categorySelect.handleToggle}
                    onBlur={categorySelect.handleBlur}
                    onFocus={(!online && !offlineMode) ? undefined : categorySelect.handleFocus}
                    onKeyDown={(!online && !offlineMode) ? undefined : categorySelect.handleKeyDown}
                >
                    <p
                        className='select-head'
                        ref={categoryHeadRef}
                    >
                        {category?.name || t('All categories')}
                    </p>
                    <div
                        className='select-buttons'
                    >
                        <SlideLeft
                            visibility={category != 'All categories'}
                        >
                            <FontAwesomeIcon
                                className='cancel-select'
                                icon={faXmark}
                                onClick={() => {
                                    setCategory('All categories')
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
                    // style={{maxWidth: tagMaxWidth}}
                    onClick={tagSelect.handleToggle}
                    onBlur={tagSelect.handleBlur}
                    onFocus={tagSelect.handleFocus}
                    onKeyDown={tagSelect.handleKeyDown}
                >
                    <p
                        className='select-head'
                        ref={tagHeadRef}
                    >
                        {tag?.name ? `#${t(tag.name)}` : t('All tags')}
                    </p>
                    <div
                        className='select-buttons'
                    >
                        <FontAwesomeIcon
                            className='cancel-select'
                            icon={faXmark}
                            tabIndex={tag != 'All tags' ? '0' : '1'}
                            onClick={() => {
                                setTag('All tags')
                            }}
                            style={{
                                '--opacity': tag != 'All tags' ? 1 : 0
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
            {/* list */}
            <NotesList/>
            {renderHotkeys}
        </div>
    )
}

export default Notes