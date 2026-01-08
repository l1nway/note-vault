import Cookies from 'js-cookie'
import {appStore} from '../store'

const getTrash = (
    path,
    setDeletedLoading = () => {},
    setArchivedLoading = () => {}
) => {
    const {setTrash, setArchive} = appStore.getState()
    //
    const token = [
        localStorage.getItem('token'),
        Cookies.get('token')
    ].find(
        token => token
    &&
        token !== 'null'
    )

    const trashUrl = `http://api.notevault.pro/api/v1/notes?${path == 'trash' ? 'deleted' : path}=true`

    fetch(trashUrl, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            authorization: 
                `Bearer ${token}`
    }})
    .then(res => res.json())
    .then(resData => {
    if (path == 'trash') {
        setTrash(resData.data)
        setDeletedLoading(false)
    } else
        setArchive(resData.data)
        setArchivedLoading(false)
})}

export default getTrash