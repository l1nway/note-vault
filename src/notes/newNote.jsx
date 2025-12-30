import './newNote.css'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useTranslation} from 'react-i18next'
import {useLocation} from 'react-router'
import {useState} from 'react'

import {faArrowUp as faArrowUpSolid, faFloppyDisk, faXmark, faTriangleExclamation, faSpinner, faRotateRight, faSignal, faPlane, faPlaneCircleCheck} from '@fortawesome/free-solid-svg-icons'

import {apiStore, appStore} from '../store'

import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import Hotkey from '../components/hotkey'

import NoteEditor from './noteEditor'
import NoteForm from './noteForm'

function NewNote() {
    const location = useLocation()
    const online = apiStore(state => state.online)
    const {offlineMode, setOfflineMode} = appStore()

    const {t} = useTranslation()

    const {state, actions, refs} = NoteEditor()
    const {loading, saving, errors, note} = state
    const {navigate, clearInputs, newNote, modifyNote, inputShake, markdownToggle, retryLoad, setVisibility, setErrors} = actions
    const {inputRef, selectRef, tagRef, markdownRef} = refs

    const saveButton = () => {
        if (note.name == '') {
            inputShake(inputRef)
            setErrors(prev => ({
                ...prev,
                input: true
            }))
            return
        }

        if (location.state == null) {
            newNote()
            return
        } else {
            modifyNote()
        }
    }

    const [offline, setOffline] = useState(Cookies.get('offline') == 'true')

    const hotkeys = [{
        key: 'mod+z, esc',
        trigger: () => navigate(-1)
    },{
        key: 'mod+s, alt+s, shift+s',
        trigger: () => saveButton()
    },{
        key: 'mod+n, alt+n, shift+n',
        trigger: () => inputRef.current?.focus()
    },{
        key: 'mod+c, alt+c, shift+c',
        trigger: () => {
            selectRef.current?.focus()
            setVisibility(prev => ({...prev, category: !prev.category}))
        }
    },{
        key: 'mod+t, alt+t, shift+t',
        trigger: () => tagRef.current?.focus()
    },{
        key: 'mod+m, alt+m, shift+m',
        trigger: () => {
            markdownRef.current?.focus()
            markdownToggle()
        }
    }]

    const renderHotkeys = hotkeys.map((element, index) =>
        <Hotkey
            key={index}
            keys={element.key}
            onTrigger={element.trigger}
            enabled={element.enabled}
        />
    )

    return (
        <div
            className='newnote-main'
        >
            {/* HEADER */}
            <div
                className='newnote-header'
            >   
                <div
                    className='newnote-top'
                >
                    <button
                        className='back-notes'
                        onClick={() => {
                            navigate(-1)
                            clearInputs()
                        }}
                    >
                        <FontAwesomeIcon
                            className='title-arrow'
                            icon={faArrowUpSolid}
                        />
                        {t('Back to notes')}
                    </button>
                    <SlideLeft
                        visibility={errors.global}
                    >
                        <FontAwesomeIcon
                            className='newnote-loading-error'
                            icon={faTriangleExclamation}
                            tabIndex='0'
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={saving}
                    >
                        <FontAwesomeIcon
                            className='newnote-saving-icon'
                            icon={faFloppyDisk}
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
                    className='newnote-buttons'
                >
                    <button
                        to='../notes'
                        onClick={() => {
                            navigate(-1)
                            clearInputs()
                        }}
                        className='newnote-cancel-button'
                    >
                        <FontAwesomeIcon
                            className='cancel-button-icon'
                            icon={faXmark}
                        />
                        {t('cancel')}
                    </button>
                    <button
                        className={`newnote-save-button ${note.name == '' && '--unavailable'}`}
                        tabIndex={note.name == '' && -1}
                        onClick={saveButton}
                        disabled={errors.global}
                    >
                        <FontAwesomeIcon
                            className='save-button-icon'
                            icon={faFloppyDisk}
                        />
                        {t(location.state == null ? 'create' : 'save')}
                    </button>
                </div>
            </div>
            <SlideDown
                visibility={errors.global}
            >   
                <label
                    className='newnote-error-message'
                    tabIndex='0'
                    onClick={() => {online ? retryLoad() : setOfflineMode(true)}}
                >
                    <span>
                        {t('Error')} {location.state == null ? 'loading' : 'saving'} {t('note')}
                    </span>
                    <span>
                        {t(errors.globalMessage)}
                    </span>
                    <SlideDown
                        visibility={online && errors.global}
                    >
                        <div
                            className='newnote-retry-action'
                        >
                            <FontAwesomeIcon
                                className='newnote-retry-icon'
                                icon={faRotateRight}
                            />
                            <span
                                className='newnote-retry-text'
                            >
                                {t('retry?')}
                            </span>
                        </div>
                    </SlideDown>
                    <SlideDown
                        visibility={!online && errors.global}
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
                </label>
            </SlideDown>
            {/* FORM */}
            <NoteForm
                actions={actions}
                state={state}
                refs={refs}
            />
            {renderHotkeys}
        </div>
    )
}
export default NewNote