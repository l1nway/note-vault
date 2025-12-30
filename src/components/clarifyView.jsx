
import {useState, useEffect} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faXmark, faSpinner, faTriangleExclamation, faArrowUp as faArrowUpSolid, faBookmark as faBookmarkSolid} from '@fortawesome/free-solid-svg-icons'
import {ColorPicker, useColor} from 'react-color-palette'
import 'react-color-palette/css'

import SlideLeft from './slideLeft'

import {pendingStore, apiStore, appStore} from '../store'
import {clarifyValue} from './clarifyTexts'
import SlideDown from './slideDown'

const ClarifyView = ({t, logic, props, renderColors}) => {

    const online = apiStore(state => state.online)
    const {trash, setTrash, notes, archive, offlineMode, setOfflineMode} = appStore()

    const {state, actions, pathData} = logic
    const {action, clarifyLoading, loadingError} = state
    const {path, effectivePath} = pathData
    const {closeAnim, get, setLoadingError, setClarifyLoading, offlineChange,
            change, removeSavingError} = actions

    const clarify = clarifyValue[effectivePath]?.[action]

    const {schedule} = pendingStore()

    const [inputNull, setInputNull] = useState(false)

    const [color, setColor] = useColor(props.color ? props.color : 'white')

    const [picker, setPicker] = useState(false)

    const [save, setSave] = useState(false)

    useEffect(() => {
        props?.setColor?.(color?.hex)
    }, [color])

    return (
        <div
            className={`clarify-main
                ${state.visibility ? 'visible' : ''}`}
            onClick={
                state.visibility
                    ? actions.closeAnim
                    : null
            }
        >
            <div
                className='clarify-content'
                onClick={(e) => e.stopPropagation()}
                style={{
                    '--loading': clarifyLoading ? '4px' : '0'
                }}
            >
                <div
                    className='clarify-head'
                >
                    <div
                        className='clarify-top-title'
                    >
                        <h2
                            className='clarify-title'
                        >
                            {t(clarify?.title) || 'title'}
                        </h2>
                        <SlideLeft
                            visibility={clarifyLoading}
                        >
                            <FontAwesomeIcon
                                className='clarify-loading-icon'
                                icon={faSpinner}
                            />
                        </SlideLeft>
                        <SlideLeft
                            visibility={loadingError || (!offlineMode && !online)}
                        >
                            <FontAwesomeIcon
                                className='clarify-error-icon'
                                icon={faTriangleExclamation}
                                onClick={() => {
                                    if (online) {
                                        get()
                                        setLoadingError(false)
                                        setClarifyLoading(true)
                                }}}
                            />
                        </SlideLeft>
                    </div>

                    <FontAwesomeIcon
                        onClick={closeAnim}
                        className='clarify-close'
                        icon={faXmark}
                        tabIndex='0'
                    />
                </div>

            <label className='clarify-name'>
                <span className='clarify-name-title'>
                    {t(clarify?.desc) || 'desc'}
                </span>

                {(action == 'edit' || action == 'new') ? (
                    <input
                        className={`clarify-input ${inputNull && --animated-error}`}
                        disabled={loadingError || (!offlineMode && !online)}
                        value={props.name}
                        onChange={e => props.setName(e.target.value)}
                        placeholder={
                            path == 'categories'
                                ? t('e.g. work, personal, ideas')
                                : t('e.g. urgent, ideas, review')
                        }
                    />
                ) : null}
            </label>

            {path == 'categories' && action != 'delete' ? (
                <>
                <SlideDown
                    visibility={!picker}
                >
                    <div className='clarify-color'>
                        <span className='clarify-color-title'>
                            {t('color')}
                        </span>
                        
                        <div
                            className={`clarify-colors ${(loadingError || (!offlineMode && !online)) && '--disabled'}`}
                        >
                            {renderColors}
                        </div>
                    </div>
                </SlideDown>
                <button
                    className='clarify-custom-color'
                    onClick={() => setPicker(!picker)}
                    disabled={!online && !offlineMode}
                >
                    {t(!picker ? 'Want yours?' : 'Choose from ready')}
                    <FontAwesomeIcon
                        className='newnote-category-arrow'
                        // clarify-custom-arrow
                        icon={faArrowUpSolid}
                        style={{
                            '--arrow-direction': picker ? '0deg' : '180deg'
                        }}
                    />
                </button>
                <SlideDown
                    visibility={picker}
                >
                    <span
                        className='clarify-custom-title'
                    >
                        {t('Select your shade manually')}
                    </span>
                    <div 
                        className='custom-color-picker'
                    >
                        <ColorPicker
                            color={color}
                            onChange={setColor}
                            hideControls={false} 
                            hideInput={false}
                        />
                    </div>
                </SlideDown>
                <SlideDown
                    visibility={picker && color.hex != props.color}
                >
                    <label
                        className='clarify-custom-save'
                        tabIndex='0'
                    >
                        <input
                            type='checkbox'
                            checked={save}
                            onChange={() => setSave(!save)}
                        />
                        <span
                            className='custom-save-title'
                        >
                            {t('Save custom color')}
                        </span>
                        <div
                            className='save-checkbox'
                        >
                            <FontAwesomeIcon
                                className='save-checkbox-icon'
                                icon={faBookmarkSolid}
                                style={{
                                    '--opacity': save ? 1 : 0
                                }}
                            />
                        </div>
                    </label>
                </SlideDown>
                </>
            ) : null}

            <div className='clarify-buttons'>
                <button
                    className='clarify-cancel'
                    onClick={() => {
                        closeAnim()
                        props?.setName?.('')
                        props?.setColor?.('')
                        props?.setID?.('')
                        setClarifyLoading(true)
                        removeSavingError(props.id, path)
                    }}
                >
                    {t('cancel')}
                </button>

                <button
                    disabled={
                        loadingError || (!offlineMode && !online) || clarifyLoading ||
                        (action == 'new' || action == 'edit')
                            ? props.name == ''
                            : null
                    }
                    onClick={() => {
                        const context = {
                            id: props.id,
                            action: action,
                            name: props.name,
                            color: props.color,
                            path: path
                        }

                        action == 'unarchive' && console.log('работает')
                        
                        if (action == 'new' || action == 'edit' || action == 'unarchive' || action == 'restore') {
                            offlineChange()
                            return
                        }
                        if (action == 'archive' || action == 'delete' || action == 'force') {
                            // setTrash(prev => [
                            //     ...prev,
                            //     {
                            //         ...notes.find(n => n.id == props.id),
                            //         syncing: true,
                            //         syncAction: action
                            //     }
                            // ])

                            const pendingId = crypto.randomUUID()
                            
                            schedule({
                                ...context,
                                pendingId,
                                onTimeout: () => offlineChange(context), 
                                onCommit: () => change(context) 
                            })

                            closeAnim()
                        }
                        removeSavingError(props.id, path)
                        
                        props?.setName?.('')
                        props?.setColor?.('')
                        props?.setID?.('')
                    }}
                    className='clarify-action'
                    style={
                        (action == 'delete' || action == 'force')
                            ? {
                                  '--btn-bg': 'var(--del-btn)',
                                  '--btn-bg-hvr': 'var(--del-btn-hvr)',
                              }
                            : {
                                  '--btn-bg': 'var(--def-btn)',
                                  '--btn-bg-hvr': 'var(--def-btn-hvr)',
                              }
                    }
                >
                    {t(clarify?.button)}
                </button>
            </div>
            </div>
        </div>
    )
}

export default ClarifyView