import './login.css'

import {useTranslation} from 'react-i18next'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBook as faBookSolid, faTriangleExclamation, faBookmark as faBookmarkSolid, faSignal} from '@fortawesome/free-solid-svg-icons'
import {faGoogle, faApple} from '@fortawesome/free-brands-svg-icons'
import {Link} from 'react-router'

import authLogic from './authLogic'

import SlideDown from './components/slideDown'

function Login() {

    const {t} = useTranslation()

    const {
        path, text, online,

        name, setName,
        email, setEmail,
        password, setPassword,
        confirm, setConfirm,
        remember, setRemember,

        serverError,
        emailError,
        passError,
        matchError,
        passMatch,
        allFilled,

        emailValid,
        passLegit,
        submitRequest,
        setServerError
    } = authLogic()

    return(
        <>
            <SlideDown
                visibility={!online}
            >
                <Link
                    className='login-loading-error'
                    onClick={() => setOfflineMode(true)}
                    to='/notes'
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
                                {t('Authorization and registration are not available without an internet connection.')}
                            </span>
                        </div>
                    </div>
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
                </Link>
            </SlideDown>
            <SlideDown
                visibility={online}
            >
                <div
                    className='login-main'
                >
                    <div
                        style={{position: 'absolute',
                            top: 0
                        }}
                    >
                        это для теста пока в разработке
                        qwerty@qwerty.com
                        12345678
                        user@email.com
                        11111111
                    </div>
                    {/* login header (logo, title & desc) */}
                    <header
                        className='login-header'
                    >
                        <FontAwesomeIcon
                            className='login-logo'
                            icon={faBookSolid}
                        />
                        <h2
                            className='login-title'
                        >
                            {t(text.title)}
                        </h2>
                        <p
                            className='login-desc'
                        >
                            {t(text.desc)}
                        </p>
                    </header>
                    <div
                        className='login-wrapper'
                    >
                        {/* login form */}
                        <form
                            className='login-values'
                        >
                            {path == 'register' ?
                                <div
                                    className='login-email'
                                >
                                    <p
                                        className='email-title'
                                    >
                                        {t('name')}
                                    </p>
                                    <input
                                        className='email-input'
                                        type='email'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            : null}
                            <div
                                className='login-email'
                            >
                                <p
                                    className='email-title'
                                >
                                    {t('email')}
                                </p>
                                <input
                                    className='email-input'
                                    type='email'
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        path == 'register'
                                            ? emailValid(e.target.value)
                                            : null
                                        setServerError(false)
                                    }}
                                />
                            </div>
                            <SlideDown
                                visibility={emailError}
                            >
                                <div
                                    className='error-message'
                                >
                                    {t('enter a valid email address')}
                                </div>
                            </SlideDown>
                            <div
                                className='login-password'
                            >
                                <p
                                    className='password-title'
                                >
                                    {t('password')}
                                </p>
                                <input
                                    className='password-input'
                                    type='password'
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        path == 'register'
                                            ? passLegit(e.target.value)
                                            : null
                                        setServerError(false)
                                    }}
                                />
                            </div>
                            <SlideDown
                                visibility={passError}
                            >
                                <div
                                    className='error-message'
                                >
                                    {t(matchError)}
                                </div>
                            </SlideDown>
                            <SlideDown
                                visibility={serverError}
                            >
                                <div
                                    className='error-message'
                                >
                                    {t('password or login is entered incorrectly')}
                                </div>
                            </SlideDown>
                            {path == 'register' ? <>
                                <div
                                    className='login-password'
                                >
                                    <p
                                        className='password-title'
                                    >
                                        {t('confirm password')}
                                    </p>
                                    <input
                                        className='password-input'
                                        type='password'
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                    />
                                </div>
                                <SlideDown
                                    visibility={!passMatch}
                                >
                                    <div
                                        className='error-message'
                                    >
                                        {t("passwords don't match")}
                                    </div>
                                </SlideDown>
                            </> : null}
                            {path == 'login' ?
                                <div
                                    className='login-buttons'
                                >
                                    <label
                                        className='login-remember'
                                        tabIndex='0'
                                    >
                                        <div
                                            className='remember-checkbox'
                                        >
                                            <FontAwesomeIcon
                                                className='checkbox-icon'
                                                icon={faBookmarkSolid}
                                                style={{
                                                    '--opacity': remember ? 1 : 0
                                                }}
                                            />
                                        </div>
                                        <input
                                            type='checkbox'
                                            checked={remember}
                                            onChange={() => setRemember(!remember)}
                                        />
                                        <span
                                            className='remember-title'
                                        >
                                            {t('remember me')}
                                        </span>
                                    </label>
                                        <label
                                            tabIndex='0'
                                            className='login-forgot'
                                        >
                                            {t('forgot password')}?
                                        </label>
                                </div>
                            : null}
                            
                            <button
                                type='button'
                                className='sign-button'
                                onClick={() => submitRequest()}
                                disabled={!allFilled || (
                                    path == 'register' &&
                                    (passError || emailError || !passMatch)
                                )}
                            >
                                {t(text.button)}
                            </button>
                            <div
                                className='login-alternative'
                            >
                                <span
                                    className='alternative-text'
                                >
                                    {t('or continue with')}
                                </span>
                            </div>

                            <button
                                type='button'
                                className='login-google'
                            >
                                <FontAwesomeIcon
                                    className='google-icon'
                                    icon={faGoogle}
                                />
                                <span
                                    className='google-text'
                                >
                                    {t(text.google)}
                                </span>
                            </button>

                            <button
                                type='button'
                                className='login-apple'
                            >
                                <FontAwesomeIcon
                                    className='apple-icon'
                                    icon={faApple}
                                />
                                <span
                                    className='apple-text'
                                >
                                    {t(text.apple)}
                                </span>
                            </button>

                            <Link
                                className='create-account'
                                to={path == 'login' ? '/register' : '/login'}
                            >
                                <p
                                    className='create-text'
                                >
                                    {t(text.altdesc)}
                                </p>
                                <p
                                    className='create-link'
                                    to='/register'
                                >
                                    {t(text.altact)}
                                </p>
                            </Link>
                        </form>
                    </div>
                </div>
            </SlideDown>
        </>
    )
}

export default Login