import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Cookies from 'js-cookie'

import SlideDown from '../components/slideDown'

function Password(props) {

    const {t} = useTranslation()

    // individual token of the logged-in user
    const token = localStorage.getItem('token') || Cookies.get('token') || ''

    // user's email is taken to check whether the user will enter it as a password
    const email = localStorage.getItem('email') || Cookies.get('email') || ''

    // three states to fill values in the inputs
    const [password, setPassword] = useState('')
    const [newPass, setNewPass] = useState('')
    const [confirmPass, setConfirmPass] = useState('')

    // error message activity status; is filled with the server's response
    const [serverOK, setServerOK] = useState(true)

    // new password entry error message activity status; password checked by a special function
    const [newPassValid, setNewPassValid] = useState(true)

    // checking if the new and confirming passwords match
    const newPassMatch = 
        confirmPass.length > 0 && newPass.length > 0
            ? newPass == confirmPass
            : true

    // the button appears only when all inputs are filled in
    const allFilled = password && newPass && confirmPass

    // button becomes available only if all fields are valid
    const allValid = newPassMatch && newPassValid && serverOK

    // function for checking the liquidity of the entered new password
    const passLegit = (value) => {
        if (value.length == 0) {
            setNewPassValid(true)
            return true
        }

        if (value.length < 8) {
            setLegitMessage('Password must be at least 8 characters long')
            setNewPassValid(false)
            return false
        }

        if (/\s/.test(value)) {
            setLegitMessage('Password must not contain spaces')
            setNewPassValid(false)
            return false
        }

        if (email && value.includes(email)) {
            setLegitMessage('Password must not match your email address')
            setNewPassValid(false)
            return false
        }

        setNewPassValid(true)
        return true
    }

    const [legitMessage, setLegitMessage] = useState(null)
    // content of the message that appears according to the type of illiquidity

    // contacting the server to change the password
    const changePass = async () => {
        try {
            const res = await fetch(`http://api.notevault.pro/api/v1/profile/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: password,
                    password: newPass,
                    password_confirmation: confirmPass,
                }),
            })

        if (!res.ok) {
            setServerOK(false)
            return
        }

        props.setPasswordChanged(true)
        props.setChangingPassword(false)

        const timer = setTimeout(() => 
            props.setPasswordChanged(false),
        7000)

        return () => clearTimeout(timer)

        } catch (err) {
            console.error('Fetch failed:', err)
            setServerOK(false)
        }
    }

    //

    // action — actions when changing input
    // value — input value
    // legit — true/false, password error output
    // message — output error value
    // button — save button visibility, used only at the end
    const passwordInputs = [
        {
            title: 'Current password',
            placeholder: 'Enter your current password',
            action: (value) => {
                setPassword(value),
                setServerOK(true)
            },
            value: password,
            legit: serverOK,
            message: 'Entered password is incorrect'
        },{
            title: 'New password',
            placeholder: 'Enter your new password',
            action: (value) => {
                setNewPass(value),
                passLegit(value)
            },
            value: newPass,
            legit: newPassValid,
            message: legitMessage
        },{
            title: 'Confirm new password',
            placeholder: 'Enter the new password again',
            action: (value) => setConfirmPass(value),
            value: confirmPass,
            legit: newPassMatch,
            message: "Passwords don't match",
            button: true
        }
    ]

    // 
    const renderChange = passwordInputs.map((element, index) =>
        <>
            <label
                className='profile-change-password'
                key={index}
            >
                <span
                    className='profile-password-title'
                >
                    {t(element.title)}
                </span>
                <input
                    placeholder={t(element.placeholder)}
                    type='password'
                    value={element.value}
                    onChange={(e) => 
                        element.action(e.target.value)
                    }
                    className='profile-password-input'
                />
            </label>
            <SlideDown
                visibility={!element.legit}
                key={index+10}
            >
                <p
                    className='profile-password-legit'
                >
                    {t(element.message)}
                </p>
            </SlideDown>
            {element.button ?
                <button
                    className='profile-password-save'
                    disabled={!allFilled || !allValid}
                    onClick={() => changePass()}
                    key={index+20}
                >
                    {t('save changes')}
                </button>
            : null}
        </>
    )

    // 

    return(
        <>
            {renderChange}
        </>
    )
}

export default Password
