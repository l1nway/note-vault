import {useState, useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useNavigate} from 'react-router'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowUp as faArrowUpSolid, faPlaneCircleCheck} from '@fortawesome/free-solid-svg-icons'

import {editorStore} from '../store'
import {profileStore} from '../store'

import Password from './password'
import Connections from './connections'
import SlideDown from '../components/slideDown'

function ProfileSettings() {

    const {t, i18n} = useTranslation()

    const navigate = useNavigate()

    const [passwordChanged, setPasswordChanged] = useState(false)

    // state for a file in the editor
    const {tempFile} = profileStore()

    // 
    
    const [langChanged, setLangChanged] = useState(false)

    // image editor visibility
    const {setVisible} = editorStore()

    // subpage visibility states
    const [changingPassword, setChangingPassword] = useState(false)
    const [connections, setConnections] = useState(false)
    const [changingLang, setChangingLang] = useState(false)
    const [logout, setLogout] = useState(false)

    // 

    const langList = useMemo(() => [{
        icon: '🇷🇺',
        name: 'russian',
        code: 'ru'
    },
    {
        icon: '🇺🇦',
        name: 'ukrainian',
        code: 'ua'
    },
    {
        icon: '🇵🇱',
        name: 'polish',
        code: 'pl'
    },{
        icon: '🇬🇧',
        name: 'english',
        code: 'en'
    }], [])

    const renderLangs = useMemo(() => 
        langList.map((element, index) =>
        <label
            className='slctd-lang'
            key={index}
        >
            <input
                className='lang-checkbox'
                type='radio'
                checked={localStorage.getItem('lang') == element.code}
                onChange={() => {
                    localStorage.setItem('lang', element.code)
                    i18n.changeLanguage(element.code)
                    setChangingLang(false)
                    setLangChanged(true)
                    setTimeout(() => 
                        setLangChanged(false),
                    7000)
                }}
            />
            <div
                className='lang-icon'
            >
                {element.icon}
            </div>
            <div
                className='lang-name'
            >
                {t(element.name)}
            </div>
        </label>
        ), 
        [langList, i18n, t, setChangingLang, setLangChanged]
    )

    // array with account settings buttons

    // // title — button name
    // // class — button class
    // // action — subpage visibility toggle
    // // visibility — subpage visibility status
    // // component — subpage component
    // // message — appearing message returned from the component
    const settingsButtons = useMemo(() => [
        {
            title: 'Change language',
            class: 'language-settings',
            action: () => {
                setLangChanged(false)
                setChangingLang(prev => !prev)
            },
            visibility: changingLang,
            component: 
                <div
                    className='lang-settings'
                >
                    {renderLangs}
                </div>,
            message: 
                <SlideDown
                    visibility={langChanged}
                >
                    <div
                        className='settings-password-changed'
                    >
                        {t('Changed successfully')}
                    </div>
                </SlideDown>
        },{
            title: 'Change password',
            class: 'settings-password',
            action: setChangingPassword,
            visibility: changingPassword,
            component: 
                <Password
                    setChangingPassword={setChangingPassword}
                    setPasswordChanged={setPasswordChanged}
                />,
            message: 
                <SlideDown
                    visibility={passwordChanged}
                >
                    <div
                        className='settings-password-changed'
                    >
                        {t('Changed successfully')}
                    </div>
                </SlideDown>
        },{
            title: 'Connected accounts',
            class: 'settings-accounts',
            action: setConnections,
            visibility: connections,
            component: <Connections/>
        },{
            title: 'Log-out',
            class: 'logout',
            action: setLogout,
            visibility: logout,
            component: 
                <div
                    className='logout-buttons'
                >
                    <button
                        className='logout-cancel'
                        onClick={() => setLogout(false)}
                    >
                        {t('cancel')}
                    </button>
                    <button
                        className='logout-true'
                        onClick={() => {
                            localStorage.removeItem('token')
                            localStorage.removeItem('avatar')
                            Cookies.remove('token')
                            Cookies.remove('avatar')

                            navigate('/login')
                        }}
                    >
                        {t('Confirm logout')}
                    </button>
                </div>
        },{
            title: 'Delete account',
            class: 'settings-delete',
            action: 'Delete'
        }
    ])

    // render account settings buttons
    const renderSettings = useMemo(() => 
        settingsButtons.map((element, index) => 
        <div
            key={index}
        >
            <button
                className={element.class}
                onClick={() => element.action(prev => !prev)}
            >
                {t(element.title)}
                <FontAwesomeIcon
                    icon={faArrowUpSolid}
                    className='arrow-icon'
                    style={{
                        '--arrow-direction': element.visibility ? '0deg' : '180deg'
                    }}
                />
            </button>
            {element.message}
            <SlideDown
                visibility={element.visibility}
            >
                {element.component}
            </SlideDown>
        </div>
        )
    )

    // 

    // presence of a temporary file determines the existence of a image editor, if the file exists, a super-short timeout is started, allowing the animation to play
    useEffect(() => {
        if (tempFile != null) {
            setTimeout(() => {
                setVisible(true)
            }, 10)

            return () => clearTimeout()
        }
    }, [tempFile])

    const [offline, setOffline] = useState(
        Cookies.get('offline') == 'true'
    ) 

    return (
        <div
            className='profile-settings'
        >
            <h2
                className='settings-title'
            >
                {t('Account settings')}
            </h2>
            <label
                className='settings-offline-mode'
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
            <div
                className='settings-buttons'
            >
                {renderSettings}
            </div>
        </div>
    )}

export default ProfileSettings