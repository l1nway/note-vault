import {create} from 'zustand'
import {persist} from 'zustand/middleware'

const parseValue = (v) => {
  if (v == 'null' || v == null) return null
  if (v == 'true') return true
  if (v == 'false') return false
  return v
}

export const appStore = create(
  persist(
    (set, get) => ({
      online: navigator.onLine,
      offlineMode: false,
      offlineActions: [],
      isSyncing: false,
      notes: [],
      tags: [],
      categories: [],

      setOnline: (status) => set({online: status}),
      setOfflineMode: (status) => set({ offlineMode: status }),
      setIsSyncing: (v) => set({ isSyncing: v }),
      setNotes: (fn) =>
        typeof fn == 'function' ? set(state => ({notes: fn(state.notes)})) : set({notes: fn}),
      setTags: (fn) =>
        typeof fn == 'function' ? set(state => ({tags: fn(state.tags)})) : set({tags: fn}),
      setCategories: (fn) =>
        typeof fn == 'function' ? set(state => ({categories: fn(state.categories)})) : set({categories: fn}),

      addOfflineActions: (action) =>
        set(state => ({
          offlineActions: [...(state.offlineActions || []), action],
        })),

      removeOfflineAction: (actionTempId) =>
        set(state => ({
          offlineActions: [...(state.offlineActions.filter(a => a?.payload?.tempId !== actionTempId))],
        })),

      updateOfflineActionId: (tempId, realId) =>
        set(state => ({
          offlineActions: state.offlineActions.map(action => {
            if (action.type == 'edit' && (action.payload.id == tempId || action.payload.tempId == tempId)) {
              return { ...action, payload: {...action.payload, id: realId}}
            }
            return action
          }),
        })),
    }),
    {name: 'app-storage'}
  )
)

window.addEventListener('online', () => appStore.getState().setOnline(true))
window.addEventListener('offline', () => appStore.getState().setOnline(false))

export const apiStore = create((set) => ({
  online: navigator.onLine,
  setOnline: (status) => set({online: status}),
}))

window.addEventListener('online', () => apiStore.getState().setOnline(true))
window.addEventListener('offline', () => apiStore.getState().setOnline(false))

export const profileStore = create((set) => ({
  file: null,
  setFile: (newFile) => set({file: newFile}),
  removeFile: () => set({file: null}),

  tempFile: null,
  setTempFile: (newFile) => set({tempFile: newFile}),
  removeTempFile: () => set({tempFile: null}),

  fileError: false,
  setFileError: (settings) => set({fileError: settings}),

  profileLoading: false,
  setProfileLoading: (settings) => set({profileLoading: settings}),

  profileSaving: false,
  setProfileSaving: (settings) => set({profileSaving: settings}),

  profileError: false,
  setProfileError: (settings) => set({profileError: settings}),

  profileMessage: false,
  setProfileMessage: (settings) => set({profileMessage: settings}),
}))

export const notesViewStore = create((set) => ({
    notesView: 'grid',

    setNotesView: (view) => set({notesView: view})
}))

export const screenStore = create((set) => ({
    screen: 'desktop',

    setScreen: (display) => set({screen: display})
}))

export const clarifyStore = create((set) => ({
  // general
  action: false,
  errorAction: false,
  visibility: false,
  animating: false,

  // notes
  notesLoading: true,
  setNotesLoading: (clarify) => set({notesLoading: clarify}),

  notesError: false,
  setNotesError: (clarify) => set({notesError: clarify}),

  notesMessage: '',
  setNotesMessage: (clarify) => set({notesMessage: clarify}),

  // 
  clarifyLoading: true,
  loadingError: false,
  loadingErrorMessage: '',
  savings: {},
  savingErrors: {},
  retryFunction: null,
  currentElementId: null,

  setErrorAction: (clarify) => set({errorAction: clarify}),
  setAction: (clarify) => set({action: clarify}),
  setVisibility: (clarify) => set({visibility: clarify}),
  setAnimating: (clarify) => set({animating: clarify}),
  setClarifyLoading: (clarify) => set({clarifyLoading: clarify}),
  setLoadingError: (clarify) => set({loadingError: clarify}),
  setLoadingErrorMessage: (clarify) => set({loadingErrorMessage: clarify}),
  setSavings: (update) => set((state) => ({
      savings: typeof update == 'function' ? update(state.savings) : update 
  })),
    setSavingErrors: (update) => set((state) => ({
      savingErrors: typeof update == 'function' ? update(state.savingErrors) : update 
  })),
    removeSavingError: (id, path) => set((state) => {
    if (!path || !state.savingErrors[path]) return state
    const newPathErrors = { ...state.savingErrors[path]}
    delete newPathErrors[id]
    return {
        savingErrors: {
            ...state.savingErrors,
            [path]: newPathErrors
        }
    }
}),
  setRetryFunction: (fn) => set({retryFunction: fn}),
  setCurrentElementId: (id) => set({currentElementId: id})
}))

export const pendingStore = create((set, get) => ({
  pendings: [],

  schedule: ({id, action, path, payload, onCommit, onTimeout}) => {
    
    get().undo(id)

    const timeoutId = setTimeout(() => {
      if (onTimeout) onTimeout()
      if (navigator.onLine) {
        get().commit(id)
      } else {
        set(state => ({
          pendings: state.pendings.map(p => 
            p.id == id ? { ...p, status: 'ready', timeoutId: null } : p
          )
        }))
        // get().remove(id)
      }
    }, 5000)

    set(state => ({
      pendings: [
        ...state.pendings,
        {
          id,
          action,
          path,
          payload,
          onCommit,
          onTimeout,
          timeoutId,
          status: 'waiting',
          expiresAt: Date.now() + 5000
        }
      ]
    }))
  },

  commit: async (id) => {
    const item = get().pendings.find(p => p.id == id)
    if (!item || item.status == 'processing') return

    set(state => ({
      pendings: state.pendings.map(p => p.id === id ? {...p, status: 'processing'} : p)
    }))

    try {
      await item.onCommit()
      get().remove(id)
    } catch (e) {
      console.error('error', e)
      set(state => ({
        pendings: state.pendings.map(p => p.id == id ? {...p, status: 'ready'} : p)
      }))
    }
  },

  undo: (id) => {
    const item = get().pendings.find(p => p.id === id)
    if (!item) return

    clearTimeout(item.timeoutId)
    get().remove(id)
  },

  remove: (id) =>
    set(state => ({
      pendings: state.pendings.filter(p => p.id !== id)
    }))
}))

export const editorStore = create((set) => ({
  act: false,
  visible: false,

  setAct: (share) => set({act: share}),
  setVisible: (visible) => set({visible: visible})
}))

export const settingStore = create((set) => ({
  action: null,
  visibility: false,

  setAction: (settings) => set({action: settings}),
  setVisibility: (visible) => set({visibility: visible})
}))

export const tokenStore = create((set) => ({
  token: null,
  setToken: (userToken) => set({token: userToken})
}))
