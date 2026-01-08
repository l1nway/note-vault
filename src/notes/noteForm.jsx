
import {useTranslation} from 'react-i18next'
import {useMemo, useCallback} from 'react'

import MDEditor from '@uiw/react-md-editor'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTriangleExclamation, faXmark, faArrowUp as faArrowUpSolid, faBookmark as faBookmarkSolid} from '@fortawesome/free-solid-svg-icons'

import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import Options from '../components/options'
import useSelect from '../components/useSelect'

import {appStore} from '../store'
import {apiStore} from '../store'

function NoteForm({state, actions, refs}) {
    const {t} = useTranslation()
    
    const online = apiStore(state => state.online)
    const categories = appStore(state => state.categories)
    const tags = appStore(state => state.tags)

    const {loading, errors, note, visibility} = state
    const {setVisibility, selectTag, markdownToggle, retryLoad, setNote, setErrors, setTextareaFocus} = actions

    const {inputRef, selectRef, tagRef, markdownRef} = refs

    const tagsDisabled = useMemo(
        () => (tags?.length ?? 0) == 0,
        [tags]
    )

    const openSelect = useMemo(() => (
        note.category.name !== 'Category not selected' &&
        note.category.name !== 'Error loading categories' &&
        note.category.name !== 'No categories created' &&
        note.category.name !== 'Loading categories'
    ), [note.category.name])

    const clearSelect = useMemo(() => (
        note.category.name !== 'Error loading categories' &&
        note.category.name !== 'No categories created' &&
        note.category.name !== 'Loading categories'
    ), [note.category.name])

    const renderCategories = useMemo(() => 
        categories?.map((element, index) =>
            <div
                className='newnote-select-option'
                onClick={() => {
                    setNote(prev => ({
                        ...prev,
                        category: element
                    }))
                    setVisibility(prev => ({...prev, category: false}))
                }}
                tabIndex='0'
                key={index}
            >
                {element.name}
            </div>
        ), 
        [categories, setNote, setVisibility]
    )

    const catsDisabled = useMemo(
        () => (categories?.length ?? 0) == 0 || loading || errors.categories,
        [categories, loading]
    )

    const setCategoryOpen = useCallback(() => {
        setVisibility(prev => ({...prev, category: !prev.category}))
    }, [setVisibility])
    
    const categorySelect = useSelect({
        disabled: catsDisabled,
        isOpen: visibility.category,
        setIsOpen: setCategoryOpen
    })

    // display list of tags
    const renderTags = useMemo(() => 
        tags?.map((element, index) => 
            <div
                key={index}
                className='newnote-tag-element'
                tabIndex='0'
                onClick={() => selectTag(element)}
                ref={index == 0 ? tagRef : null}
            >
                {t(element.name)}
                <input
                    type='checkbox'
                    checked={note.selectedTags?.some(tag => tag.id == element.id)}
                    onChange={() => selectTag(element)}
                />
            </div>
        ), [tags, t, selectTag, note.selectedTags, tagRef])

    return (
        <form
            className='newnote-form'
        >
            {/* NAME */}
            <label
                className={`newnote-name-label
                    ${loading ? '--loading' : ''}
                `}
            >
                <div
                    className='newnote-name-title'
                >
                    <span
                        className='newnote-name'
                    >
                        {t('Note name')}
                    </span>
                    <SlideLeft
                        visibility={errors.global || errors.input}
                    >
                        <FontAwesomeIcon
                            className='newnote-loading-error'
                            icon={faTriangleExclamation}
                            onClick={() => {(online && errors.global) && retryLoad()}}
                            tabIndex='0'
                        />
                    </SlideLeft>
                </div>
                <div
                    className='newnote-input-group'
                >
                    <input
                        className={
                            `newnote-input
                            ${errors.input && '--animated-error'}
                            ${errors.global && '--loading-input-error'}
                            `}
                        ref={inputRef}
                        value={errors.global
                            ? 'Error loading name'
                            : loading
                                ? 'Loading name'
                                : note.name
                        }
                        disabled={loading || errors.global}
                        onChange={e => {
                            setNote(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))
                            setErrors(prev => ({
                                ...prev,
                                input: false
                            }))
                        }}
                        placeholder={t('Note title')}
                    />
                    {loading &&
                        <span
                            className='loading-dots --input'
                        >
                            <i></i><i></i><i></i>
                        </span>
                    }
                </div>
                <SlideDown
                    visibility={errors.input}
                >
                    <span
                        className='newnote-input-error'
                    >
                        {t(errors.inputMessage)}
                    </span>
                </SlideDown>
            </label>
            {/* CATEGORY SELECT */}
            <label
                className={`newnote-category-label 
                    ${catsDisabled && !errors.categories ? '--loading' : ''} 
                    ${errors.categories ? '--cats-error' : ''}
                    ${loading ? '--loading' : ''}
                    `
                }
                onClick={!catsDisabled && categorySelect.handleToggle}
                onBlur={!catsDisabled && categorySelect.handleBlur}
                onFocus={!catsDisabled && categorySelect.handleFocus}
                onKeyDown={!catsDisabled && categorySelect.handleKeyDown}
            >
                <div
                    className='newnote-category-title'
                >
                    <span
                        className='newnote-category'
                    >
                        {t('category')}
                    </span>
                    <SlideLeft
                        visibility={errors.categories}
                    >
                        <FontAwesomeIcon
                            className='newnote-loading-error'
                            icon={faTriangleExclamation}
                            onClick={() => online && retryLoad()}
                            tabIndex='0'
                        />
                    </SlideLeft>
                </div>
                <div
                    className={`newnote-category-select 
                        ${catsDisabled && !errors.categories ? '--loading-hvr' : ''} 
                        ${errors.categories ? '--cats-error-hvr' : ''}`
                    }
                    tabIndex={note.categories?.length == 0 ? -1 : 0}
                    ref={selectRef}
                >
                    <div
                        className='category-select-title'
                    >
                        {t(note.category?.name)}
                        <SlideLeft
                            visibility={loading}
                        >
                            <span className='loading-dots'>
                                <i></i><i></i><i></i>
                            </span>
                        </SlideLeft>
                    </div>
                    <div
                        className='newnote-select-buttons'
                    >
                        <SlideLeft
                            visibility={openSelect}
                        >
                            <FontAwesomeIcon
                                className='newnote-category-cancel'
                                icon={faXmark}
                                tabIndex='0'
                                onClick={() => setNote(prev => ({
                                    ...prev,
                                    category: {name: 'Category not selected'}
                                }))}
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={clearSelect}
                            >
                            <FontAwesomeIcon
                                className={`newnote-category-arrow 
                                    ${(catsDisabled && !errors.categories) ? '--loading-hvr' : ''} 
                                    ${errors.categories ? '--cats-error-hvr' : ''}`
                                }
                                icon={faArrowUpSolid}
                                style={{
                                    '--arrow-direction': visibility.category ? '0deg' : '180deg'
                                }}
                            />
                        </SlideLeft>
                    </div>
                    <Options
                        visibility={visibility.category}
                        selectRef={selectRef}
                    >
                        <div
                            className='newnote-select-list'
                            style={{
                                '--select-border': visibility.category ? '0.1vw solid #2a2f38' : '0.1vw solid transparent',
                                '--select-background': visibility.category ? '#1f1f1f' : 'transparent',
                                '--opacity': visibility.category ? 1 : 0
                            }}
                        >
                            {renderCategories}
                        </div>
                    </Options>
                </div>
            </label>
            {/* TAG PICKER */}
            <label
                className={`newnote-tag-label
                    ${tagsDisabled && !errors.tags ? '--loading' : ''} 
                    ${errors.tags ? '--cats-error' : ''}
                    ${loading ? '--loading' : ''}
                    `
                }
                tabIndex={-1}
            >
                <div
                    className='newnote-category-title'
                >
                    <span
                        className='newnote-category'
                    >
                        {t('tags')}
                    </span>
                    <SlideLeft
                        visibility={errors.tags}
                    >
                        <FontAwesomeIcon
                            className='newnote-loading-error'
                            icon={faTriangleExclamation}
                            tabIndex='0'
                            onClick={() => online && retryLoad()}
                        />
                    </SlideLeft>
                </div>
                <SlideDown
                    visibility={errors.tags || loading || tagsDisabled}
                >
                    <span
                        className={`tags-error-message ${errors.tags && 'true-error'}`}
                    >
                        {t(errors.tagsMessage)}
                        <SlideLeft
                            visibility={loading}
                        >
                            <span className='loading-dots'>
                                <i></i><i></i><i></i>
                            </span>
                        </SlideLeft>
                    </span>
                </SlideDown>
                <SlideDown
                    visibility={visibility.tags && !tagsDisabled}
                >
                    <div
                        className='newnote-tags'
                        tabIndex={-1}
                    >
                        {renderTags}
                    </div>
                </SlideDown>
            </label>
            {/* CONTENT */}
            <div
                className={
                    `newnote-content-label
                    ${loading ? '--loading' : ''}
                `}
            >
                <div
                    className='newnote-content'
                >
                    <div
                        className='newnote-name-title'
                    >
                        <span
                            className='newnote-content-title'
                        >
                            {t('content')}
                        </span>
                        <SlideLeft
                            visibility={errors.global}
                        >
                            <FontAwesomeIcon
                                className='newnote-loading-error'
                                icon={faTriangleExclamation}
                                onClick={() => online && retryLoad()}
                                tabIndex='0'
                            />
                        </SlideLeft>
                    </div>
                    <label
                        className='newnote-markdown'
                        tabIndex='0'
                        ref={markdownRef}
                        style={{
                                    '--color': note.markdown ? 'var(--def-white)' : 'var(--blck-bc-fcs)',
                                    pointerEvents: errors.global && 'none'
                                }}
                    >
                        <p
                            className='newnote-markdown-title'
                        >
                            {t('markdown')}
                        </p>
                        <div
                            className='newnote-markdown-checkbox'
                        >
                            <FontAwesomeIcon
                                className='newnote-checkbox-icon'
                                icon={faBookmarkSolid}
                                style={{
                                    '--opacity': note.markdown ? 1 : 0
                                }}
                            />
                        </div>
                        <input
                            type='checkbox'
                            disabled={loading || errors.global}
                            checked={note.markdown}
                            onChange={markdownToggle}
                        />
                    </label>
                </div>
                    {!note.markdown ? (
                        <div
                            className='newnote-content-group'
                        >
                            <span
                                className='loading-dots --textarea'
                                style={{
                                    opacity: loading ? 1 : 0,
                                    pointerEvents: !loading && 'none'
                                }}
                            >
                                <div
                                    className='content-loading-placeholder'
                                >
                                    {t('Loading content')}
                                </div>
                                <i></i><i></i><i></i>
                            </span>
                            <textarea
                                className={`
                                    newnote-content-textarea
                                    ${loading ? '--loading' : ''}
                                    ${errors.global && '--loading-input-error'}
                                `}
                                value={errors.global ? 'Error loading content' : note.content}
                                onChange={e => setNote(
                                    prev => ({
                                        ...prev,
                                        content: e.target.value
                                    }))}
                                disabled={loading || errors.global}
                                onFocus={() => setTextareaFocus(true)}
                                onBlur={() => setTextareaFocus(true)}
                            />
                        </div>) : 
                    (
                        <div
                            className='newnote-content-markdown'
                        >
                                <MDEditor
                                    value={note.content}
                                    onChange={(value) => setNote(
                                        prev => ({
                                            ...prev,
                                            content: value
                                    }))}
                                    preview='live'
                                    hideToolbar={false}
                                    className={`newnote-md-editor ${visibility.markdown ? 'visible' : null}`}
                                    style={{height: '100%'}}
                                    onFocus={() => setTextareaFocus(true)}
                                    onBlur={() => setTextareaFocus(true)}
                                />
                        </div>
                    )}
            </div>
        </form>
    )
}

export default NoteForm