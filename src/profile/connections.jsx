import './connections.css'

import {useState, useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGoogle} from '@fortawesome/free-brands-svg-icons'
import {faApple} from '@fortawesome/free-brands-svg-icons'

import SlideLeft from '../components/slideDown'

function Connections() {

    const {t} = useTranslation()

    const connected = useMemo(() => [
        {
            name: 'google',
            icon: faGoogle,
            class: '--google',
            account: 'google user',
            date: '20-12-2025',
            active: false
        },{
            name: 'apple',
            icon: faApple,
            class: '--apple',
            account: 'apple user',
            date: '21-12-2025',
            active: true
        }
    ], [])

    const renderAccs = useMemo(() => 
        connected.map((element, index) =>
        <div
            className='profile-connected-accs'
            key={index}
        >
            <div
                className='profile-connected-service'
            >
                <FontAwesomeIcon
                    icon={element.icon}
                    className={`profile-connected-icon ${element.class}`}
                />
                <p
                    className={`profile-connected-name ${element.class}`}
                >
                    {t(element.name)}
                </p>
            </div>
            <div
                className='profile-connected-info'
            >
                <div
                    className='profile-connected-account'
                >
                    {element.account}
                </div>
                <div
                    className='profile-connected-date'
                >
                    {element.date}
                </div>
            </div>
            <div
                className='profile-connected-change'
            >
                <SlideLeft
                    visibility={element.active}
                >
                    <button
                        className='profile-connected-switch'
                    >
                        {t('switch')}
                    </button>
                </SlideLeft>
                <button
                    className='profile-connected-add'
                    style={{
                        '--bc-color': element.active ? 'var(--del-btn)' : 'var(--def-btn)',
                        '--hover': element.active ? 'var(--del-btn-hvr)' : 'var(--def-btn-hvr)' 
                    }}
                >
                    {t(element.active ? 'remove' : 'add')}
                </button>
            </div>
        </div>
        ), 
        [connected, t]
    )

    return (
        <div
            className='connected-main'
        >
            {renderAccs}
        </div>
    )
}

export default Connections