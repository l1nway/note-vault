import {CSSTransition} from 'react-transition-group'
import {useRef} from 'react'

export default function Options({visibility, children, duration = 300, selectRef}) {
  
  const nodeRef = useRef(null)

  const selectHeight = selectRef?.current?.offsetHeight

  const setInitialStyles = (element) => {
        element.style.position = 'absolute'
        element.style.top = `${selectHeight}px`
        element.style.left = '0'
        element.style.width = '100%'
        // element.style.padding = '0.5vw 1vw'
        element.style.borderRadius = '1vw'
        element.style.overflow = 'hidden'
        element.style.zIndex = '1'
    }

  return (
    <CSSTransition
      in={visibility}
      timeout={duration}
      classNames='options'
      unmountOnExit
      nodeRef={nodeRef}
      onEnter={() => {
        setInitialStyles(nodeRef.current)
        nodeRef.current.style.height = '0px'
        nodeRef.current.style.transition = ''
      }}
      onEntering={() => {
        nodeRef.current.style.transition = `height ${duration}ms ease`
        nodeRef.current.style.height = `${nodeRef.current.scrollHeight}px`
      }}
      onEntered={() => {
        nodeRef.current.style.height = 'auto'
        nodeRef.current.style.transition = ''
      }}
      onExit={() => {
        nodeRef.current.style.height = `${nodeRef.current.scrollHeight}px`
        nodeRef.current.style.transition = `height ${duration}ms ease`
      }}
      onExiting={() => {
        nodeRef.current.style.height = '0px'
      }}
      onExited={() => {
        nodeRef.current.style.transition = ''
      }}
    >
      <div
        ref={nodeRef}
      >
        {children}
      </div>
    </CSSTransition>
  )
}