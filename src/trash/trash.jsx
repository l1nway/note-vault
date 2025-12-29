import './trash.css'

import {useState, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import ContentLoader from 'react-content-loader'
import MDEditor from '@uiw/react-md-editor'
import {useLocation} from 'react-router'
import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTableCells as faTableCellsSolid} from '@fortawesome/free-solid-svg-icons'
import {faList as faListSolid} from '@fortawesome/free-solid-svg-icons'
import {faTrashCanArrowUp} from '@fortawesome/free-solid-svg-icons'
import {faTrash as faTrashSolid} from '@fortawesome/free-solid-svg-icons'
import {faBoxOpen} from '@fortawesome/free-solid-svg-icons'
import {faSquareCheck} from '@fortawesome/free-regular-svg-icons'
import {faFloppyDisk} from '@fortawesome/free-solid-svg-icons'
import {faTriangleExclamation} from '@fortawesome/free-solid-svg-icons'
import {faTrashCan} from '@fortawesome/free-solid-svg-icons'

import Clarify from '../components/clarify'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'

import {clarifyStore} from '../store'

function Trash() {
  
  const {t, i18n} = useTranslation()

  // used to determine whether the component will perform the login or registration function
  const location = useLocation()
  const path = location.pathname.slice(1)

  const {
        // action being performed and its purpose
        action,
        setAction,
        // error text returned by the server
        loadingError,
        setLoadingError,
        // <Clarify/> window visibility
        visibility,
        setVisibility,
        // animation status (used to block unwanted player actions during an animation that could break the animation)
        animating,
        setAnimating,
        // status and it change of data download from the server in the <Clarify/> window
        clarifyLoading,
        setClarifyLoading,
        // status of the moment of saving information
        saving,
        setSaving,
        setSavingError,
        savingError,
        setErrorAction,
        errorAction
    } = clarifyStore()

  // 
  const token = [
    localStorage.getItem('token'),
    Cookies.get('token')
  ].find(
    token => token
  &&
    token !== 'null'
  )

  const getTrash = () => {
    fetch(`http://api.notevault.pro/api/v1/notes?${path == 'trash' ? 'deleted' : path}=true`,
      {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            authorization: 
                `Bearer ${token}`
        }
      })
    .then(res => res.json())
    .then(resData => {
      // original full list
      setTrash(resData.data)
      // successful download status
      setLoading(false)
    })
  }

  // triggers the function execution on the first load
  useEffect(() => getTrash(), [])
  
  const [loading, setLoading] = useState(true)

  // refs for correctly setting focus on the checkbox imitation
  const gridRef = useRef(null)
  const listRef = useRef(null)

  const [catsView, setCatsView] = useState('grid')
  const listView = catsView == 'list'

  // 
  const [selectedNotes, setSelectedNotes] = useState([])

  const selectNote = (note) => {
    setSelectedNotes(prev =>
      prev.includes(note)
        // add
        ? prev.filter(i => i !== note)
        // remove
        : [...prev, note]
    )
  }

  // array with all tags
  const [trash, setTrash] = useState([])

  const [elementID, setElementID] = useState('')

  // 

  const openAnim = (action) => {
    if (animating == true) {
        return false
    }
    setAnimating(true)
    setAction(action)
    setErrorAction(action)

    setTimeout(() => {
        setVisibility(true)
    }, 10)

    setTimeout(() => {
        setAnimating(false)
    }, 300)
    }

  const renderTrash = trash?.map((element, index) =>
      <div
        key={index}
        className='trash-element'
        tabIndex='0'
        onClick={() => selectNote(element.id)}
      >
        {/* input for css only */}
        <input
            type='checkbox'
            className='list-view'
            checked={catsView == 'list'}
            readOnly
        />
        <input
          type='checkbox'
          className='trash-selected-input'
          checked={selectedNotes.includes(element.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => selectNote(element.id)}
        />
        <div
          className='trash-buttons'
        >
          <FontAwesomeIcon
            tabIndex='0'
            className='trash-button-archive'
            onClick={(e) => {
              setElementID(element.id)
              openAnim(path == 'trash' ? 'restore' : 'unarchive')
              e.preventDefault()
              e.stopPropagation()
            }}
            icon={path == 'trash' ? faTrashCanArrowUp : faBoxOpen}
          />
          <FontAwesomeIcon
            tabIndex='0'
            className='trash-button-delete'
            onClick={(e) => {
              openAnim(path == 'trash' ? 'force' : 'delete')
              setElementID(element.id)
              e.preventDefault()
              e.stopPropagation()
            }}
            icon={faTrashSolid}
          />
            <SlideLeft
              visibility={selectedNotes.includes(element.id)}
            >
              <FontAwesomeIcon
                icon={faSquareCheck}
                className='trash-button-checkbox'
              />
            </SlideLeft>
        </div>
        <div
          className='trash-content'
        >
            <div
              className='trash-top-group'
            >
              <h2
                className='trash-title'
              >
                {t(element.title)}
              </h2>
              {element.is_markdown ? 
                <MDEditor.Markdown
                    source={element.content}
                />
                : 
                <p
                  className='trash-desc'
                >
                  {t(element.content)}
                </p>
              }
            </div>
            <div
              className='trash-bottom-group'
            >
              <div
                className='trash-cats'
              >
                {element.category ? 
                  <div
                    className='trash-category'
                  >
                    <div
                      className='category-circle'
                    />
                    <div
                      className='category-text'
                    >
                      {t(element.category?.name)}
                    </div>
                  </div>
                : null}
              {element.tags ?
                  <div
                    className='trash-tags'
                  >
                    {element.tags?.map((tagElement, index) => (
                        <div
                          key={index}
                          className='trash-tag'
                        >
                          {tagElement.name}
                        </div>
                      ))}
                  </div>
              : null}
                </div>
                <div
                    className='trash-date'
                >
                    {new Date(element.created_at).toLocaleDateString(i18n.language, {month: 'short', day: 'numeric'})}
                </div>
            </div>
        </div>
    </div>
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
              checked={catsView == 'list'}
              onChange={() => setCatsView(catsView == 'list' ? 'grid' : 'list')}
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
        <div
          className='trash-list'
        >
          {renderTrash}
        </div>
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