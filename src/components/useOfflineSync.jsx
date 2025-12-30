import {useEffect, useRef} from 'react'
import Cookies from 'js-cookie'

import {appStore, pendingStore} from '../store'
import useApi from '../notes/useApi'
import clarifyApi from './clarifyApi'

const useOfflineSync = () => {
    const {
        online,
        offlineActions, removeOfflineAction,
        setNotes, setCategories, setTags,
        isSyncing, setIsSyncing,
        updateOfflineActionId
    } = appStore()

    const syncInProgress = useRef(false)

    const pendings = pendingStore(state => state.pendings)
    const commit = pendingStore(state => state.commit)

    const token = [localStorage.getItem('token'), Cookies.get('token')]
            .find(
                token => token
            &&
                token !== 'null'
    )

    const {createNote, editNote} = useApi(token)

    useEffect(() => {
        if (!online) return

        const processPendings = async () => {
            const readyTasks = pendings.filter(p => p.status == 'ready')
            
            for (const task of readyTasks) {
                await commit(task.id)
            }
        }

        const sync = async () => {
            if (!offlineActions.length) return    
            if (isSyncing) return
            if (syncInProgress.current) return

            syncInProgress.current = true
            setIsSyncing(true)
            
            const actionsQueue = [...offlineActions]

            const entities = {
                notes: {
                    set: setNotes,
                    create: async (payload) => {
                        const res = await createNote(payload)
                        return res
                    },
                    edit: async (id, payload) => {
                        const res = await editNote(id, payload)
                        return res.data
                    }
                },
                categories: {
                    set: setCategories,
                    create: async (payload, tempId) => {
                        return await clarifyApi({entity: 'categories', action: 'new', id: tempId, token, payload})
                    },
                    edit: async (id, payload) => {
                        return await clarifyApi({entity: 'categories', action: 'edit', id, token, payload})
                    }
                },
                tags: {
                    set: setTags,
                    create: async (payload, tempId) => {
                        return await clarifyApi({entity: 'tags', action: 'new', id: tempId, token, payload})
                    },
                    edit: async (id, payload) => {
                        return await clarifyApi({entity: 'tags', action: 'edit', id, token, payload})
                    }
                }
            }

            for (const action of actionsQueue) {
                if (action.type == 'create') {
                    const {entity, payload} = action
                    const {tempId, ...noteData} = payload

                    entities[entity].set(prev => prev.map(n => n.tempId == tempId ? {...n, syncing: true} : n))

                    try {
                        const res = await entities[entity].create(noteData)
                        
                        const serverId = res?.id

                        actionsQueue.forEach(a => {
                            if (a.type == 'edit' && a.payload.id == tempId)
                                a.payload.id = serverId
                        })

                        updateOfflineActionId(tempId, serverId)

                        entities[entity].set(prev => prev.map(n => 
                            n.tempId == tempId
                                ? { 
                                    ...n, 
                                    ...res.data, 
                                    offline: false, 
                                    syncing: false, 
                                    tempId: null, 
                                    syncAction: null 
                                } 
                                : n
                        ))

                        removeOfflineAction(tempId)
                    } catch (e) {
                        entities[entity].set(prev => prev.map(n => n.tempId == tempId ? {...n, syncing: false} : n))
                        continue
                    }
                }

                if (action.type == 'edit') {
                    const {entity, payload} = action
                    const {id, tempId, ...noteData} = payload
                    
                    if (!id || String(id).length > 10) continue 

                    entities[entity].set(prev => prev.map(n => n.id == id ? {...n, syncing: true} : n))

                    try {
                        const res = await entities[entity].edit(id, noteData)

                        entities[entity].set(prev => prev.map(n =>
                            n.id == id 
                            ? { ...n, ...res, offline: false, syncing: false, syncAction: null }
                            : n
                        ))
                        
                        removeOfflineAction(tempId)

                    } catch (e) {
                        console.log(e)
                        entities[entity].set(prev => prev.map(n => n.id == id ? {...n, syncing: false} : n))
                        
                        if (e.status == 404) {
                            removeOfflineAction(action)
                        }
                        continue
                    }
                }
            }
            
            syncInProgress.current = false
            setIsSyncing(false)
        }
        processPendings()
        sync()
    },  [online, offlineActions.length, pendings.length])
}

export default useOfflineSync