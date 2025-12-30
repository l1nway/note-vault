import './profile.css'

import {useTranslation} from 'react-i18next'
import {useLocation} from 'react-router'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faRotateRight, faSignal, faFloppyDisk, faTriangleExclamation, faTrashCan, faSpinner, faPlane, faPenToSquare, faUpload as faUploadSolid, faUserTie as faUserTieSolid, faTrash as faTrashSolid} from '@fortawesome/free-solid-svg-icons'

import {apiStore, appStore, profileStore} from '../store'

import Editor from './editor'
import User from './user'
import Settings from './settings'
import profileLogic from './profileLogic'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'

function Profile() {

    // 
    const {online} = apiStore()
    const {offlineMode, setOfflineMode} = appStore()
    const {t, i18n} = useTranslation()

    const location = useLocation()
    const path = location.pathname.slice(1)

    // 
    const {
        profileLoading, setProfileLoading,
        profileSaving, setProfileSaving,
        profileError, setProfileError,
        profileMessage, setProfileMessage,
        // state for a file in the editor
        tempFile, setTempFile,
        // state if the uploaded file is not an image
        fileError, setFileError,
        // state for a final file
        setFile, file
    } = profileStore()

    // 
    const {drag, setDrag, fileRef, handleFile, delAvatar, accDate} = profileLogic()

    return (
        <div
            className='profile-main'
        >
            {tempFile != null ? <Editor/> : null}
            <div
                className='profile-title-block'
            >
                <h1
                    className='profile-title'
                    onClick={() => console.log(tempFile)}
                >
                    {t('profile')}
                </h1>
                <SlideLeft
                        visibility={profileLoading}
                    >
                        <FontAwesomeIcon
                            className='clarify-loading-icon'
                            icon={faSpinner}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={profileSaving}
                    >
                        <FontAwesomeIcon
                            className={`loading-save-icon ${null == 'delete' ? '--trash' : null}`}
                            icon={null == 'delete' ? faTrashCan : faFloppyDisk}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={profileError}
                    >
                        <FontAwesomeIcon
                            className='loading-error-icon'
                            icon={faTriangleExclamation}
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
            <SlideDown
                visibility={!online && !offlineMode}
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
                                {t(profileMessage)}
                            </span>
                        </div>
                    </div>
                    <SlideDown
                        // visibility={notesError && online}
                        visibility={false}
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
                        // visibility={!online && notesError}
                        visibility={true}
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
            <div
                className='profile-block'
            >
                {/* upload or change avatar */}
                <label
                    className='profile-avatar'
                    htmlFor='editor-file-input'
                    style={{'--file-hover': drag ? '#2f3847' : 'transparent'}}
                    onDragOver={(e) => {
                        e.preventDefault(),
                        setDrag(true)
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDragEnd={() => setDrag(false)}
                    onDrop={(e) => {
                        e.preventDefault(),
                        setDrag(false)
                        if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
                    }}
                    // onClick={() => fileRef.current.click()}
                >
                    <input
                        type='radio'
                        checked={drag}
                        onChange={e => setDrag(e.target.checked)}
                    />
                    <div
                        className='avatar-element'
                    >
                        <input
                            type='file'
                            className='editor-file-input'
                            id='editor-file-input'
                            ref={fileRef}
                            key={tempFile ? 'has-file' : 'no-file'}
                            onChange={(e) => handleFile(e.target.files[0])}
                            accept='image/*'
                        />
                        <FontAwesomeIcon
                            style={{
                                '--icon-display': file != null ? 'none' : ''
                            }}
                            className='user-icon'
                            icon={faUserTieSolid}
                        />
                        <img
                            className='avatar-img'
                            style={{
                                '--icon-display': file == null ? 'none' : '1'
                            }}
                            src={file ? file : null}
                        />
                        <button
                            className='avatar-upload'
                            type='button'
                            style={{
                                '--bc-color': file == null ? 'var(--def-btn)' : 'var(--del-btn)',
                                '--bc-hover': file == null ? 'var(--def-btn-hvr)' : 'var(--del-btn-hvr)'
                            }}
                            onClick={(e) => {
                                e.stopPropagation(),
                                file == null ? fileRef.current.click() : delAvatar()
                            }}
                        >
                            <FontAwesomeIcon
                                className='upload-icon'
                                icon={file == null ? faUploadSolid : faTrashSolid}
                            />
                        </button>
                        <button
                            className='avatar-edit'
                            tabIndex={file ? 0 : -1}
                            type='button'
                            style={{
                                '--bc-color': file == null ? 'transparent' : 'var(--def-btn)',
                                '--pointer': file == null ? 'none' : ''
                            }}
                            onClick={(e) => (
                                e.stopPropagation(),
                                setTempFile(file)
                            )}
                        >
                            <FontAwesomeIcon
                                className='edit-icon'
                                icon={file == null ? null : faPenToSquare}
                            />
                        </button>
                    </div>
                    <SlideDown
                        visible={fileError}
                    >
                        <p
                            className='file-error'
                        >
                            {t('the file is not an image')}
                        </p>
                    </SlideDown>
                    <p
                        className='avatar-desc'
                    >
                        {t('click to change avatar')}
                    </p>
                </label>
                    <SlideDown
                        visibility={file != null}
                    >
                        <button
                            className='delete-button'
                            style={{backgroundColor: 'var(--def-btn)'}}
                            onClick={(e) => (
                                e.stopPropagation(),
                                setTempFile(file)
                            )}
                        >
                            {t('edit')}
                        </button>
                    </SlideDown>
                    <button
                        className='delete-button'
                        style={{
                            backgroundColor: file == null ? 'var(--def-btn)' : 'var(--del-btn)'
                        }}
                        onClick={(e) => {
                            e.stopPropagation(),
                            file == null ? console.log() : delAvatar()
                        }}
                        // fileRef.current.click()
                    >
                        {t(file == null ? 'upload' : 'delete')}
                    </button>
                {/* change name & email */}
                <User/>
                {/* account settings */}
                <Settings/>
                <div
                    className='profile-date'
                >
                    {t('Account created')} {new Date(accDate).toLocaleDateString(i18n.language, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </div>
                {/* slideDown window for specific settings */}
            </div>
        </div>
    )
}

export default Profile