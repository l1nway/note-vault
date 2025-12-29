const useApi = (token) => {

    const request = async (url, {
        method = 'GET',
        body
    } = {}
    ) => {
        const res = await fetch(`http://api.notevault.pro${url}`, {
            method,
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`
            },
            body: body ? JSON.stringify(body) : undefined
        })

    if (!res.ok) {
        let error
        try {
            error = await res.json()
        } catch {
            error = new Error(res.statusText)
        }
        throw error
    }

        return res.json()
    }

    const createNote = (data) =>
        request('/api/v1/notes', {
        method: 'POST',
        body: data
    })

    const getNote = (id) =>
        request(`/api/v1/notes/${id}`)

    const editNote = (id, data) =>
        request(`/api/v1/notes/${id}`, {
        method: 'PATCH',
        body: data
    })

  const getTags = () =>
        request('/api/v1/tags')

  const getCategories = () =>
        request('/api/v1/categories')

  return {
        createNote,
        getNote,
        editNote,
        getTags,
        getCategories
  }
}

export default useApi