import './clarify.css'

import {forwardRef, useImperativeHandle, useState} from 'react'
import {useTranslation} from 'react-i18next'

import ClarifyView from './clarifyView'
import useClarifyLogic from './useClarifyLogic'

    const Clarify = forwardRef((props, ref) => {
    
        const {t} = useTranslation()

        const logic = useClarifyLogic(props)

        const {state} = logic
        const {loadingError} = state

        // color storage (used only for categories)
        const colors = ['#1E90FF', '#32CD32', '#8A2BE2', '#FF8C00', '#FF1493', '#008B8B', '#3CB371', '#DC143C', '#9370DB', '#66CDAA']

        const [recentColors, setRecentColors] = useState([{
            id: 1,
            color: '#1E90FF'
        }])

        // displays a list of colors
        const renderColors = colors.map((value, index) => 
            <label
                className='color-element'
                style={{'--color-value' : value}}
                tabIndex='0'
                key={index}
            >
                <input
                    disabled={loadingError}
                    className='color-radio'
                    type='radio'
                    name='color'
                    checked={props.color == value}
                    onClick={() => props.color == value ? props.setColor(null) : props.setColor(value)}
                    onChange={() => props.color == value ? props.setColor(null) : props.setColor(value)}
                />
            </label>
        )
        // 

        // change() function from <Clarify/>; call is available if an error occurred while saving, to try again
        useImperativeHandle(ref, () => ({
            change: (context) => logic.actions.change(context)
        }))

    return (
        <ClarifyView 
            t={t} 
            logic={logic} 
            props={props} 
            renderColors={renderColors}
        />
    )
})

export default Clarify