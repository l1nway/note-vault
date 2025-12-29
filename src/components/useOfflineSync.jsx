import {useEffect, useRef} from 'react'
import Cookies from 'js-cookie'

import {appStore, pendingStore} from '../store'
import useApi from '../notes/useApi'

const useOfflineSync = () => {
    const {
        online,
        offlineActions, removeOfflineAction,
        setNotes,
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

            for (const action of actionsQueue) {
                if (action.type == 'create') {
                    const {tempId, ...noteData} = action.payload
                    
                    setNotes(prev => prev.map(n => n.tempId == tempId ? {...n, syncing: true} : n))

                    try {
                        const res = await createNote(noteData)
                        const serverId = res?.id

                        actionsQueue.forEach(a => {
                            if (a.type == 'edit' && a.payload.id == tempId)
                                a.payload.id = serverId
                        })

                        updateOfflineActionId(tempId, serverId)

                        setNotes(prev => prev.map(n => 
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
                        setNotes(prev => prev.map(n => n.tempId == tempId ? {...n, syncing: false} : n))
                        break
                    }
                }

                if (action.type == 'edit') {
                    const {id, tempId, ...noteData} = action.payload
                    
                    if (!id || String(id).length > 10) continue 

                    setNotes(prev => prev.map(n => n.id == id ? {...n, syncing: true} : n))

                    try {
                        const res = await editNote(id, noteData)

                        setNotes(prev => prev.map(n =>
                            n.id == id 
                            ? { ...n, ...res.data, offline: false, syncing: false, syncAction: null }
                            : n
                        ))
                        
                        removeOfflineAction(tempId)

                    } catch (e) {
                        console.log(e)
                        setNotes(prev => prev.map(n => n.id == id ? {...n, syncing: false} : n))
                        
                        if (e.status == 404) {
                            removeOfflineAction(action)
                        }
                        break
                    }
                }
            }
            
            syncInProgress.current = false
            setIsSyncing(false)
        }
        processPendings()
        sync()
    }, [online, offlineActions.length, pendings.length])
}

export default useOfflineSync