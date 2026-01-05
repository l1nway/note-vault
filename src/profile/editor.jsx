import {useState, useRef, useEffect, forwardRef} from 'react'
import {useGesture} from '@use-gesture/react'
import {useTranslation} from 'react-i18next'
import AvatarEditor from 'react-avatar-editor'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrash as faTrashSolid} from '@fortawesome/free-solid-svg-icons'
import {faRotateRight as faRotateRightSolid} from '@fortawesome/free-solid-svg-icons'
import {faRotateLeft as faRotateLeftSolid} from '@fortawesome/free-solid-svg-icons'

import {profileStore} from '../store'
import {editorStore} from '../store'

import SlideDown from '../components/slideDown'

const Editor = forwardRef((props, ref) => {

    const {visible, setVisible} = editorStore()

    const {t} = useTranslation()

    const token = localStorage.getItem('token') || Cookies.get('token') || ''

    // state for a final file
    const {setFile} = profileStore()

    // state for a file in the editor
    const {tempFile, setTempFile} = profileStore()
    
    //

    // ref needed to transfer the image
    const editor = useRef(null)

    // 

    const avatarContainer = useRef(null)

    //

    // states for editor
    const [zoom, setZoom] = useState(1)
    const [rotate, setRotate] = useState(0)

    //

    const MIN_ZOOM = 1
    const MAX_ZOOM = 2
    const zoomRef = useRef(1)

    const bindPinch = useGesture(
    {
        onPinchStart: () => {
            zoomRef.current = zoom
        },

        onPinch: ({movement: [mscale]}) => {
            let nextZoom = zoomRef.current * mscale
            if (nextZoom > MAX_ZOOM) nextZoom = MAX_ZOOM
            if (nextZoom < MIN_ZOOM) nextZoom = MIN_ZOOM
            setZoom(nextZoom)
        }

    },
    {
        pinch: {
            scaleBounds: {min: MIN_ZOOM, max: MAX_ZOOM},
            rubberband: true
        }
    }
    )

    useEffect(() => {
        const container = avatarContainer.current
        if (!container) return
        const preventScroll = e => e.preventDefault()

        container.addEventListener('touchmove', preventScroll, {passive: false})

        return () => container.removeEventListener('touchmove', preventScroll)
    }, [])

    //

    // state for area where editor is placed
    const editorAreaRef = useRef()

    useEffect(() => {
        const anotations = {
            // messages in case the turn has reached 180 degrees
            [-180]: 'You can no longer rotate the image to the left.',
            [180]: 'You can no longer rotate the image to the right.'
        }

        setAnnotation(anotations[rotate])
    }, [rotate])

    // func for rotating preview image
    const turn = dir => {
        // rotate image according to direction
        const start = rotate
        let target = start + (dir == 'left' ? -90 : 90)

        if (target > 180) {
            target = 180
            if (start == 180) return
        }

        if (target < -180) {
            target = -180
            if (start == -180) return
        }

        // image rotation animation
        const dur = 300
        let t0
        const ease = p => p < 0.5 ? 2*p*p : -1+(4-2*p)*p

        const anim = t => {
            t0 ||= t
            const p = Math.min((t - t0) / dur, 1)
            const val = start + (target - start) * ease(p)
            setRotate(val)
            if (p < 1) requestAnimationFrame(anim)
            
        }

        requestAnimationFrame(anim)
    }

    //

    // пока хз буду ли доделывать в итоге
    const [annotation, setAnnotation] = useState('')

    // func for reseting all values
    const reset = () => {
        setRotate(0)
        setZoom(1)
        setVisible(false)
        setTimeout(() => setTempFile(null), 350)
    }

    const setAvatar = () => {
        const canvas = editor.current.getImageScaledToCanvas()

        canvas.toBlob(blob => {
            const formData = new FormData()
            formData.append('avatar', blob, 'avatar.png'
        )

        fetch(`http://api.notevault.pro/api/v1/profile/avatar`,
            {
                method: 'POST',
                headers: {
                    authorization:
                        `Bearer ${token}`
                },
                    body: formData
            })
        .then(res => res.json())
        .then(resData => {
            setRotate(0)
            setZoom(1)
            setFile(resData.avatar_url)
            localStorage.setItem('avatar', resData.avatar_url)
            Cookies.set('avatar', resData.avatar_url)
            setVisible(false)
            setTimeout(() => setTempFile(null), 400)
        })
    })}

    return(
        <div
            className={`image-editor ${visible ? 'visible' : ''}`}
            ref={ref}
            onClick={
                visible ? () => {
                    setVisible(false)
                    setTimeout(() => setTempFile(null), 350)
                } : null}
        >
            <div
                className='editor-block'
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className='editor-area'
                    tabIndex='0'
                    ref={editorAreaRef}
                >
                    <div
                        className='editor-content'
                        ref={avatarContainer}
                        {...bindPinch()}
                        style={{touchAction: 'none'}}
                    >
                        <FontAwesomeIcon
                            className='left-rotate'
                            style={{
                                '--bc-color' : rotate == -180 ? 'gray' : '#5ea500',
                                '--color' : rotate == -180 ? '#444' : 'white',
                                '--hover' : rotate == -180 ? 'gray' : '#3e6c00',
                                '--rotate': `${rotate}deg`
                            }}
                            onClick={() => turn('left')}
                            icon={faRotateLeftSolid}
                        />
                        <div
                            className='avatar-editor'
                        >
                            <AvatarEditor
                                crossOrigin='anonymous'
                                onLoadSuccess={() => setAnnotation('The image can only be square. If your image has a different aspect ratio, you can move it to fit the desired image into the square.')}
                                // onImageChange={() => setAnnotation('For a specific angle of rotation and scaling of the image, you can use the sliders below')}
                                width={500}
                                height={500}
                                image={tempFile}
                                borderRadius={500}
                                border={0}
                                scale={zoom}
                                rotate={rotate}
                                backgroundColor='gray'
                                ref={editor}
                            />
                        </div>
                        <FontAwesomeIcon
                            className='right-rotate'
                            style={{
                                '--bc-color' : rotate == 180 ? 'gray' : '#5ea500',
                                '--color' : rotate == 180 ? '#444' : 'white',
                                '--hover' : rotate == 180 ? 'gray' : '#3e6c00',
                                '--rotate': `${rotate}deg`
                            }}
                            onClick={() => turn('right')}
                            icon={faRotateRightSolid}
                        />
                        <FontAwesomeIcon
                            onClick={() => reset()}
                            className='trash-icon'
                            icon={faTrashSolid}
                        />
                    </div>
                    <SlideDown
                        visibility={annotation}
                    >
                        <div
                            className='editor-help'
                        >
                            <span
                                // вообще анимацией предусмотрено что текст может меняться, но я не придумал грамотного использования
                                key={annotation}
                                className='help-text'
                            >
                                {t(annotation)}
                            </span>
                        </div>
                    </SlideDown>
                </div>
                <label
                    className='editor-zoom'
                >
                    <span
                        className='zoom-title'
                    >
                        {t('zoom')}
                    </span>
                    <input
                        className='zoom-range'
                        type='range'
                        min='1'
                        max='2'
                        step='0.01'
                        value={zoom}
                        onChange={(e) => setZoom(+e.target.value)}
                    />
                </label>
                <label
                    className='editor-rotate'
                >
                    <span
                        className='rotate-title'
                    >
                        {t('rotate')}
                    </span>
                    <input
                        className='rotate-range'
                        type='range'
                        min='-180'
                        max='180'
                        step='1'
                        value={rotate}
                        onChange={(e) => setRotate(+e.target.value)}
                    />
                </label>

                <button
                    className='save-button'
                    onClick={() => setAvatar()}
                >
                    {t('save')}
                </button>
                <button
                    className='cancel-button'
                    onClick={() => {
                        setVisible(false)
                        setTimeout(() =>
                            setTempFile(null), 310)
                    }}
                >
                    {t('cancel')}
                </button>
                <button
                    className='delete-button'
                    onClick={() => reset()}
                >
                    {t('delete')}
                </button>
            </div>
        </div>
    )
})

export default Editor