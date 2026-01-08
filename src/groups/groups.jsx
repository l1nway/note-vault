import './groups.css'

import {useMemo} from 'react'
import {useShallow} from 'zustand/react/shallow'
import ContentLoader from 'react-content-loader'
import {useTranslation} from 'react-i18next'
import {motion, AnimatePresence} from 'framer-motion'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlane, faTableCells as faTableCellsSolid, faList as faListSolid, faFloppyDisk, faTriangleExclamation, faRotateRight, faTrashCan, faSignal} from '@fortawesome/free-solid-svg-icons'

import Clarify from '../components/clarify'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import groupsLogic from './groupsLogic'
import GroupCard from './groupCard'

import {apiStore, appStore, clarifyStore} from '../store'

function Groups() {

    const {t} = useTranslation()
    const online = apiStore(state => state.online)

    const {offlineMode, setOfflineMode, tags, categories} = appStore(
        useShallow((state) => ({
            offlineMode: state.offlineMode,
            setOfflineMode: state.setOfflineMode,
            tags: state.tags,
            categories: state.categories,
    })))

    const {action, loadingError, loadingErrorMessage, retryFunction} = clarifyStore(
        useShallow((state) => ({
            action: state.action,
            loadingError: state.loadingError,
            loadingErrorMessage: state.loadingErrorMessage,
            retryFunction: state.retryFunction,
    })))

    const {path, loading, catsView, setCatsView, listView, elementID, setElementID, color, setColor, name, setName, openAnim, clarifyRef, gridRef, listRef} = groupsLogic()

    const items = useMemo(
        () => (path == 'tags' ? tags : categories),
        [path, tags, categories]
    )

    const renderGroups = useMemo(() => {
        return (items || []).map((element) =>
            <GroupCard
                key={element.id}
                element={element}
                openAnim={openAnim}
                setElementID={setElementID}
                setName={setName}
                setColor={setColor}
                listView={listView}
                catsView={catsView}
                setCatsView={setCatsView}
                retryFunction={retryFunction}
            />
        )
    }, [items, openAnim, listView])

    const saving = useMemo(() => items?.some(item => item?.saving), [items])

    const error = useMemo(() => items?.some(item => item?.error), [items])

    return(
        <div
            className='groups-main'
        >
            {/* header  */}
            <div
                className='groups-top'
            >
                <div
                    className='groups-top-title'
                >
                    <h1
                        className='groups-title'
                    >
                        {t(path)}
                    </h1>
                    <SlideLeft
                        visibility={saving}
                    >
                        <FontAwesomeIcon
                            className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                            icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={loadingError || error}
                    >
                        <FontAwesomeIcon
                            className='loading-error-icon'
                            icon={faTriangleExclamation}
                        />
                    </SlideLeft>
                    <SlideLeft
                        visibility={false}
                    >
                        <span
                            className='notes-error-text'
                        >
                            {t(loadingErrorMessage)}
                        </span>
                    </SlideLeft>
                    <SlideLeft
                        visibility={offlineMode}
                    >
                        <FontAwesomeIcon
                            className='newnote-offline-icon'
                            icon={faPlane}
                        />
                    </SlideLeft>
                </div>
                <div
                    className='groups-buttons'
                >
                    <label
                        className={`groups-view ${(false) && '--disabled'}`}
                    >
                        <FontAwesomeIcon
                            tabIndex='0'
                            className='view-icon'
                            icon={faTableCellsSolid}
                            ref={gridRef}
                        />
                        <FontAwesomeIcon
                            tabIndex='0'
                            className='view-icon'
                            icon={faListSolid}
                            ref={listRef}
                        />
                        <input
                            type='checkbox'
                            disabled={loadingError}
                            checked={catsView == 'list'}
                            onChange={() => setCatsView(catsView == 'list' ? 'grid' : 'list')}
                        />
                    </label>
                    <button
                        // className={`notes-new ${(!online && !offlineMode) && '--new-disabled'}`}
                        // onClick={(e) => (!online && !offlineMode) && e.preventDefault()}
                        className='groups-new'
                        onClick={() => openAnim('new')}
                        disabled={!online && !offlineMode}
                    >
                        + {t(path == 'tags' ? 'New tag' : 'New category')}
                    </button>
                </div>
            </div>
                <SlideDown
                    visibility={loading}
                >
                    <div
                        className='groups-list'
                    >
                        <ContentLoader
                            className='group-element'
                            speed={2}
                            width={300}
                            height={120}
                            backgroundColor='#1e2939' 
                            foregroundColor='#72bf00'
                            aria-label={undefined}
                            title={undefined}
                            preserveAspectRatio='none'
                        >
                            {/* 
                                rx & ry -- border-radius
                                x -- расположение по горизонтали
                                y -- расположение по вертикали
                            */}
                            
                            <circle cx='25' cy='30' r='25' /> 
                            <rect x='0' y='70' rx='4' ry='4' width='150' height='25' 
                            />
                            <rect x='0' y='105' rx='3' ry='3' width='80' height='15' 
                            />
                        </ContentLoader>
                    </div>
                </SlideDown>
                <SlideDown
                    visibility={!loading}
                >
                    <motion.div
                        layout='position'
                        className='groups-list'
                    >
                        <AnimatePresence>
                            {renderGroups}
                        </AnimatePresence>
                    </motion.div>
                </SlideDown>
                <SlideDown
                    visibility={loadingError}
                >
                    <div
                        className='groups-loading-error'
                        onClick={() => {
                            online ? turnOnlineMode() : setOfflineMode(true)
                        }}
                        // onClick={() => {
                        //     if (online) {
                        //         setLoading(true)
                        //         setLoadingError(false)
                        // }}}
                    >
                        <div
                            className='loading-error-message'
                        >
                            <FontAwesomeIcon
                                className='loading-error-icon --general'
                                icon={faTriangleExclamation}
                            />
                            <div
                                className='error-groups'
                            >
                                <span>
                                    {t('Error loading')} {t(path)}.
                                </span>
                                <span>
                                    {t(loadingErrorMessage)}
                                </span>
                            </div>
                        </div>
                    <SlideDown
                        visibility={online && loadingError}
                    >
                        <label
                            className='loading-retry-action'
                        >
                            <input
                                type='checkbox'
                                className='loading-retry-checkbox'
                                defaultChecked
                            />
                            <FontAwesomeIcon
                                className='loading-retry-icon'
                                icon={faRotateRight}
                            />
                            <span>
                                {t('retry?')}
                            </span>
                        </label>
                    </SlideDown>
                    <SlideDown
                        visibility={!online && loadingError}
                    >
                        <div
                            className='newnote-retry-action'
                        >
                            <FontAwesomeIcon
                                className='newnote-signal-icon'
                                icon={faSignal}
                            />
                            <span
                                className='newnote-offline-text'
                            >
                                {t('Go to offline mode?')}
                            </span>
                        </div>
                    </SlideDown>
                    </div>
                </SlideDown>
            {action ?
                <Clarify
                    ref={clarifyRef}
                    id={elementID}
                    setID={setElementID}
                    color={color}
                    setColor={setColor}
                    name={name}
                    setName={setName}
                />
            : null}
        </div>
    )
}

export default Groups