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
        restore: 'POST',
        force: 'DELETE'
    }
    
    // matching a method to a user action
    const method = methods[action]

    const normalizedEntity =
        entity == 'trash' || entity == 'archived'
            ? 'notes'
            : entity

    const noteActionEndpoints = {
        archive: 'archive',
        unarchive: 'unarchive',
        restore: 'restore',
        force: 'force',
    }

    const url =
        action == 'new'
            ? `http://api.notevault.pro/api/v1/${normalizedEntity}`
            : normalizedEntity == 'notes' && noteActionEndpoints[action]
                ? `http://api.notevault.pro/api/v1/notes/${id}/${noteActionEndpoints[action]}`
                : `http://api.notevault.pro/api/v1/${normalizedEntity}/${id}`


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