import './trash.css'

import {OverlayScrollbarsComponent} from 'overlayscrollbars-react'
import 'overlayscrollbars/overlayscrollbars.css'
import ContentLoader from 'react-content-loader'
import {useTranslation} from 'react-i18next'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrashCan, faTriangleExclamation, faFloppyDisk, faList as faListSolid, faTableCells as faTableCellsSolid} from '@fortawesome/free-solid-svg-icons'

import Clarify from '../components/clarify'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import trashLogic from './trashLogic'
import NoteCard from '../components/noteCard'

import {notesViewStore, clarifyStore, appStore} from '../store'

function Trash() {
  
  const {t} = useTranslation()

  const {path, loading, selectedNotes, elementID, gridRef, listRef, getTrash, setElementID, openAnim} = trashLogic()

  const {archive, setArchive, trash, setTrash} = appStore()
  
  // global state that stores the display view of notes
  const {notesView, setNotesView} = notesViewStore()

  // сonverts values ​​to true or false; for convenience (reducing unnecessary code with tags)
  const listView = notesView == 'list'

  const {
        // action being performed and its purpose
        action, setAction,
        // <Clarify/> window visibility
        setVisibility,
        // status of the moment of saving information
        saving, savingError,
        errorAction
    } = clarifyStore()

  const handleAction = (type, id) => {
      setElementID(id)
      openAnim(type)
  }

  const renderTrash = trash?.map((element, index) =>
    <NoteCard
      key={element.id}
      note={element}
      onAction={handleAction}
    />
    )

  return (
    <div
      className='trash-main'
    >
      <header
        className='trash-header'
      >
        <div
          className='notes-top-group'
        >
          <h1
            className='trash-title'
          >
            {t(path)}
          </h1>
                    
          <SlideLeft
              visibility={saving && (errorAction == 'force' || errorAction == 'delete' || errorAction == 'restore' || errorAction == 'archive' || errorAction == 'unarchive')}
          >
              <FontAwesomeIcon
                  className={`loading-save-icon ${errorAction == 'delete' ? '--trash' : null}`}
                  icon={errorAction == 'delete' ? faTrashCan : faFloppyDisk}
              />
          </SlideLeft>
          <SlideLeft
              visibility={savingError && (errorAction == 'force' || errorAction == 'delete' || errorAction == 'restore' || errorAction == 'archive' || errorAction == 'unarchive')}
          >
              <FontAwesomeIcon
                  className='loading-error-icon'
                  icon={faTriangleExclamation}
                  onClick={() => setAction('delete')}
              />
          </SlideLeft>

        </div>
        <div
          className='trash-main-buttons'
        >
          <label
              className='trash-view'
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
              checked={notesView == 'list'}
              onChange={() => setNotesView(notesView == 'list' ? 'grid' : 'list')}
            />
          </label>

          <SlideLeft
            visibility={selectedNotes.length > 0}
          >
            <button
              className='trash-new'
              onClick={() => {
                setAction('restore')
                setTimeout(() => {
                    setVisibility(true)
                }, 10)
              }}
            >
              {t('noteAction', {
                action: path == 'trash' ? 'restore' : 'unarchive',
                count: selectedNotes.length
              })}
            </button>
          </SlideLeft>
        </div>
      </header>
        <SlideDown
          visibility={listView}
        >
          <div
            className='groups-table'
          >
              <p
                className='tab-element'
              >
                {t('title & description')}
              </p>
              <p
                className='tab-element'
              >
                {t(`${path == 'trash' ? 'archiving' : 'deleting'} date`)}
              </p>
              <p
                className='tab-element'
              >
                {t('restore')}
              </p>
          </div>
      </SlideDown>
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
        <OverlayScrollbarsComponent
          className='profile-scroll'
          options={{
              scrollbars: {
                  autoHide: 'never',
                  autoHideDelay: 0,
                  theme: 'os-theme-dark'
              }
          }}
        >
          <div
            className='trash-list'
          >
            {renderTrash}
          </div>
        </OverlayScrollbarsComponent>
      </SlideDown>
      {action ?
        <Clarify
          id={elementID}
          getTrash={getTrash}
          setTrash={setTrash}
          elementsIDs={selectedNotes}
        /> : null}
    </div>
  )
}

export default Trash