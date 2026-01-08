import Cookies from 'js-cookie'
import {clarifyStore, appStore} from '../store'

const getGroups = async (path, setLoading = () => {}) => {
    const {tags, categories, setGroups} = appStore.getState()
    const {setLoadingError, setLoadingErrorMessage} = clarifyStore.getState()

    const token = [
        localStorage.getItem('token'),
        Cookies.get('token')
    ].find(
        token => token
    &&
        token !== 'null'
    )

    const group = path == 'tags' ? tags : categories

    group?.length == 0 && setLoading(true)
    try {
        const res = await fetch(`http://api.notevault.pro/api/v1/${path}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`
            }
        })
        if (!res.ok) throw new Error(`${res.status}`)

        const resData = await res.json()
        setGroups(resData)
        setLoadingError(false)
    } catch (error) {
        setLoadingErrorMessage(error)
    } finally {
        setLoading(false)
    }
}

export default getGroups