import './share.css'

import {useState, useRef, useMemo} from 'react'
import {useTranslation} from 'react-i18next'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowUp as faArrowUpSolid} from '@fortawesome/free-solid-svg-icons'
import {faXmark} from '@fortawesome/free-solid-svg-icons'

import Options from './options'

import {editorStore} from '../store'

function Share() {

    const {t} = useTranslation()

    // storage of data about action and visibility, their combination is used for the animation performance
    const {visible, setVisible, setAct} = editorStore()

    // ref is used to pass the required information about the height of the drop-down menu of the select component
    const selectRef = useRef(null)

    //

    // selector open status
    const [durationStatus, setDurationStatus] = useState(false)

    // selector value
    const [durationValue, setDurationValue] = useState('Duration not selected')

    // list of time variations for how long the link will be available
    const durations = useMemo(() => ['5 minutes', '30 minutes', '1 hour', '24 hour', '7 day', 'No expiration'], [])

    // display list of time variations
    const renderDurations = useMemo(() => 
        durations.map((element, index) =>
            <div
                className='newnote-select-option'
                onClick={() => setDurationValue(element)}
                tabIndex='0'
                key={index}
            >
                {element}
            </div>
        ), 
        [durations, setDurationValue]
    )

    // 

    return (
        <div
            className={`share-main ${visible ? 'visible' : ''}`}
            onClick={
                visible ? () => {
                    setVisible(false)
                    setTimeout(() => setAct(false), 350)
                } : null}
        >
            <div
                className='share-header'
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className='share-head'
                >
                    <h2
                        className='share-title'
                    >
                        {t('Share note')}
                    </h2>
                    <FontAwesomeIcon
                        className='share-close'
                        icon={faXmark}
                        onClick={() => (
                                setVisible(false),
                                setTimeout(() => setAct(false), 350)
                        )}
                    />
                </div>
                <p
                    className='share-desc'
                >
                    {t('Create a shareable link to allow others to view this note')}
                </p>

                <div
                    className='share-label'
                >
                    <span
                        className='share-label-title'
                    >
                        {t('Link duration')}
                    </span>
                    <label
                        className='share-category-select'
                        tabIndex='0'
                        onClick={() => setDurationStatus(!durationStatus)}
                        onBlur={() => setDurationStatus(false)}
                        ref={selectRef}
                    >
                        {t(durationValue)}
                        <FontAwesomeIcon
                            className='share-category-arrow'
                            icon={faArrowUpSolid}
                            style={{
                                '--arrow-direction': durationStatus ? '0deg' : '180deg'
                            }}
                        />
                        <Options
                            visibility={durationStatus}
                            selectRef={selectRef}
                        >
                            <div
                                className='share-select-list'
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    '--select-border': durationStatus ? '0.1vw solid #2a2f38' : '0.1vw solid transparent',
                                    '--select-background': durationStatus ? '#1f1f1f' : 'transparent',
                                    '--opacity': durationStatus ? 1 : 0
                                }}
                            >
                                {renderDurations}
                            </div>
                        </Options>
                    </label>
                </div>

                <button
                    className='share-button'
                >
                    {t('Сreate share link')}
                </button>
            </div>
        </div>
    )
}

export default Share