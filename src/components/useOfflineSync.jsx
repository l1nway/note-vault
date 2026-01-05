import {useEffect, useRef} from 'react'
import Cookies from 'js-cookie'

import {appStore, pendingStore} from '../store'
import useApi from '../notes/useApi'
import clarifyApi from './clarifyApi'

const useOfflineSync = () => {
    const {online, offlineActions, removeOfflineAction, setNotes, setCategories, setTags, setArchive, setTrash, isSyncing, setIsSyncing, updateOfflineActionId} = appStore()

    const syncInProgress = useRef(false)

    const tempCategoryIds = useRef(new Map())
    const tempTagIds = useRef(new Map())

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

        const resolveRelationIds = (payload) => {
            const resolved = JSON.parse(JSON.stringify(payload))

            if (resolved.category_id) {
                const realId = tempCategoryIds.current.get(resolved.category_id)
                    if (realId) {
                        resolved.category_id = realId
                    }
            }

            if (Array.isArray(resolved.tag_ids)) {
                resolved.tag_ids = resolved.tag_ids.map(tagId => tempTagIds.current.get(tagId) || tagId)
            }

            return resolved
        }

        const sync = async () => {
            if (!offlineActions.length) return    
            if (isSyncing) return
            if (syncInProgress.current) return

            syncInProgress.current = true
            setIsSyncing(true)
            
            const actionsQueue = JSON.parse(JSON.stringify(offlineActions))

            const priority = {
                categories: 1,
                tags: 1,
                notes: 2
            }

            actionsQueue.sort((a, b) =>
                (priority[a.entity] ?? 99) - (priority[b.entity] ?? 99)
            )

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
                    },
                    archive: async (id) => await clarifyApi({entity: 'notes', action: 'archive', id, token}),
                    delete: async (id) => await clarifyApi({entity: 'notes', action: 'delete', id, token}),
                },
                categories: {
                    set: setCategories,
                    create: async (payload, tempId) => {
                        return await clarifyApi({entity: 'categories', action: 'new', id: tempId, token, payload})
                    },
                    edit: async (id, payload) => {
                        return await clarifyApi({entity: 'categories', action: 'edit', id, token, payload})
                    },
                    delete: async (id) => await clarifyApi({entity: 'categories', action: 'delete', id, token}),
                },
                tags: {
                    set: setTags,
                    create: async (payload, tempId) => {
                        return await clarifyApi({entity: 'tags', action: 'new', id: tempId, token, payload})
                    },
                    edit: async (id, payload) => {
                        return await clarifyApi({entity: 'tags', action: 'edit', id, token, payload})
                    },
                    delete: async (id) => await clarifyApi({entity: 'tags', action: 'delete', id, token}),
                },
                archived: {
                    set: setArchive,
                    unarchive: async (payload, tempId) => {
                        return await clarifyApi({entity: 'archived', action: 'unarchive', id: tempId, token, payload})
                    },
                    delete: async (id) => await clarifyApi({entity: 'archived', action: 'delete', id, token}),
                },
                trash: {
                    set: setTrash,
                    restore: async (payload, tempId) => {
                        return await clarifyApi({entity: 'trash', action: 'restore', id: tempId, token, payload})
                    },
                    force: async (id) => await clarifyApi({entity: 'archived', action: 'force', id, token}),
                }
            }

            for (const action of actionsQueue) {
                if (action.type == 'create') {
                    const {entity, payload} = action
                    const {tempId, ...noteData} = payload

                    entities[entity].set(prev => prev.map(n => n.tempId == tempId ? {...n, syncing: true} : n))

                    try {
                        const resolvedPayload =
                            entity == 'notes'
                                ? resolveRelationIds(noteData)
                                : noteData
                        const res = await entities[entity].create(resolvedPayload, tempId)
                        
                        const serverId = res?.id ?? res?.data?.id
                        if (!serverId) throw new Error('No server id returned')

                        if (entity == 'categories') {
                            tempCategoryIds.current.set(tempId, serverId)
                        }

                        if (entity == 'tags') {
                            tempTagIds.current.set(tempId, serverId)
                        }

                        actionsQueue.forEach(a => {
                            if (a.payload?.id == tempId || a.payload?.tempId == tempId) {
                                a.payload.id = serverId
                                a.payload.tempId = null
                            }
                        })

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
                        const resolvedPayload =
                            entity == 'notes'
                                ? resolveRelationIds(noteData)
                                : noteData

                        const res = await entities[entity].edit(id, resolvedPayload)

                        entities[entity].set(prev => prev.map(n =>
                            n.id == id 
                            ? {...n, ...res, offline: false, syncing: false, syncAction: null}
                            : n
                        ))
                        
                        removeOfflineAction(id || tempId)

                    } catch (e) {
                        console.log(e)
                        entities[entity].set(prev => prev.map(n => n.id == id ? {...n, syncing: false} : n))
                        
                        if (e.status == 404) {
                            removeOfflineAction(id || tempId)
                        }
                        continue
                    }
                }

                if (action.type == 'unarchive' || action.type == 'restore') {
                    const {entity, payload, tempId} = action
                    const id = payload?.id || tempId

                    if (!id) continue

                    entities[entity].set(prev =>
                        prev.map(n =>
                            n.id == id || n.tempId == id
                                ? {...n, syncing: true}
                                : n
                        )
                    )

                    try {
                        await entities[entity][action.type](payload, id)

                        entities[entity].set(prev =>
                            prev.map(n =>
                                n.id == id || n.tempId == id
                                    ? {
                                        ...n,
                                        offline: false,
                                        syncing: false,
                                        syncAction: null
                                    }
                                    : n
                            )
                        )

                        removeOfflineAction(id || tempId)

                    } catch (e) {
                        console.error(e)

                        entities[entity].set(prev =>
                            prev.map(n =>
                                n.id == id || n.tempId == id
                                    ? {...n, syncing: false}
                                    : n
                            )
                        )

                        continue
                    }
                }

                if (['archive', 'delete', 'force'].includes(action.type)) {
                    const {entity, payload, tempId} = action
                    const id = payload?.id || tempId

                    if (!id) continue

                    try {
                        await entities[entity][action.type](id)
                        pendingStore.getState().remove(action.pendingId || id)
                        
                        removeOfflineAction(id || tempId)
                    } catch (e) {
                        console.error(`Ошибка при ${action.type}:`, e)
                        if (e.status == 404) removeOfflineAction(id || tempId)
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