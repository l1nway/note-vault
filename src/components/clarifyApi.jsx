const clarifyApi = async ({
    entity,
    action,
    id,
    token,
    payload
}) => {
    // different methods are used for different actions; object with correspondences
    const methods = {
        new: 'POST',
        edit: 'PATCH',
        delete: 'DELETE',
        archive: 'POST',
        unarchive: 'POST',
        force: 'DELETE'
    }
    
    // matching a method to a user action
    const method = methods[action]

    // final URL regarding the user's action and link
    const url =
        action == 'new'
        ? `http://api.notevault.pro/api/v1/${entity}`
        : `http://api.notevault.pro/api/v1/${entity}/${id}`

    const res = await fetch(url, {
        method,
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`
        },
        ...(payload && ['POST', 'PATCH', 'PUT'].includes(method)
        ? {body: JSON.stringify(payload)}
        : {})
    })

    if (!res.ok) throw new Error('Server Error')

    const data = await res.json().catch(() => ({}))
    return data
}

export default clarifyApi