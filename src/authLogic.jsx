import './login.css'

import {useState} from 'react'
import {useNavigate} from 'react-router'

import {useLocation} from 'react-router'
import Cookies from 'js-cookie'

import {clarifyStore, appStore, apiStore} from './store'

function authLogic() {

    const online = apiStore(state => state.online)

    const navigate = useNavigate()

    // used to determine whether the component will perform the login or registration function
    const location = useLocation()
    const path = location.pathname.slice(1)

    const {setNotesError, setNotesLoading, setNotesMessage, setSavings} = clarifyStore()
    const {setNotes, setTags, setCategories, setArchive, setTrash} = appStore()

    // send data to the server for login or registration
    const submitRequest = async () => {
        try {
            const res = await fetch(`http://api.notevault.pro/api/v1/auth/${path}`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        password_confirmation: confirm,
                    })
            })
            
        const resData = await res.json()
        if (!res.ok) throw new Error(resData.message)

        const saved = [
            ['token', resData.token],
            ['name', resData.user.name],
            ['email', resData.user.email],
            ['verif', resData.user.email_verified_at],
            ['accdate', resData.user.created_at],
            ['avatar', resData.user.avatar_url],
            ['remember', remember]
        ]

        remember
            ? saved.map(([key, value]) => localStorage.setItem(key, value))
            : saved.map(([key, value]) => Cookies.set(key, value, {expires: 1}))

        getData(resData.token)
        navigate('/notes')

        } catch {
            setServerError(true)
        }
    }

    const endpoints = [
        {key: 'categories', setter: setCategories},
        {key: 'tags', setter: setTags},
        {key: 'notes', setter: setNotes},
        {key: 'notes?archived=true', setter: setArchive},
        {key: 'notes?deleted=true', setter: setTrash}
    ]

    const getData = async (token) => {
        try {
            setNotesLoading(true)
            setNotesError(false)

            const fetchPromises = endpoints.map(endpoint =>
                fetch(`http://api.notevault.pro/api/v1/${endpoint.key}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${token}`,
                    },
                })
                .then(res => {
                    if (!res.ok) throw new Error(`Error loading ${endpoint.key}`)
                    return res.json()
                })
                .then(resData => {
                    const keys = ['notes', 'notes?archive=true', 'notes?deleted=true']

                    endpoint.setter(
                        keys.includes(endpoint.key) ? resData.data : resData
                    )
                    setSavings(prev => ({...prev, [endpoint.key]: false}))
                })
            )

            await Promise.all(fetchPromises)

            setNotesLoading(false)
        } catch (error) {
            // setNotesMessage(error.message)
            // setNotesLoading(false)
            // setNotesError(true)
    }}

    // four states to fill values in the inputs
    const [name, setName] = useState('')
    const [confirm, setConfirm] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    // checkbox remember me
    const [remember, setRemember] = useState(false)

    // checking if the new and confirming passwords match
    const passMatch = 
        confirm.length > 0 && password.length > 0
            ? password == confirm
            : true

    // checks whether all inputs are filled in
    const allFilled = path == 'register'
        ? name && email && password && confirm
        : email && password

    // visibility of error message from server
    const [serverError, setServerError] = useState(false)
    const [emailError, setEmailError] = useState(false)
    const [passError, setPassError] = useState(false)
    const [matchError, setMatchError] = useState(false)

    // function to check whether the email address is entered correctly
    const emailValid = (value) => {
        if (value.length == 0) {
            setEmailError(false)
            return true
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            setEmailError(true)
            return true
        }

        setEmailError(false)
        return true
    }

    // function for checking the liquidity of the entered new password
    const passLegit = (value) => {
        if (value.length == 0) {
            setPassError(false)
            return
        }

        if (value.length < 8) {
            setMatchError('password must be at least 8 characters long')
            setPassError(true)
            return
        }

        if (/\s/.test(value)) {
            setMatchError('password must not contain spaces')
            setPassError(true)
            return
        }

        if (email == value) {
            setMatchError('password must not match your email address')
            setPassError(true)
            return
        }
        setPassError(false)
    }

    // 
    const texts = {
        register: {
            title: 'welcome to the notes app',
            desc: 'register to start using notes',
            button: 'register',
            google: 'register using Google',
            apple: 'register using Apple',
            altdesc: 'already have an account?',
            altact: 'log in',
        },
        login: {
            title: 'welcome back',
            desc: 'sign in to access your notes',
            button: 'sign in',
            google: 'sign with Google',
            apple: 'sign with Apple',
            altdesc: "don't have an account?",
            altact: 'sign up',
        },
    }

    return {
        path,
        text: texts[path],
        online,

        // state
        name, setName,
        email, setEmail,
        password, setPassword,
        confirm, setConfirm,
        remember, setRemember,

        // errors
        serverError,
        emailError,
        passError,
        matchError,
        passMatch,

        // flags
        allFilled,

        // handlers
        emailValid,
        passLegit,
        submitRequest,
        setServerError,
    }
}

export default authLogic