import {useRef} from 'react'

function useSelect({
    disabled,
    isOpen,
    setIsOpen
}) {
    const justFocused = useRef(false)

    const handleBlur = (e) => {
        if (e.currentTarget.contains(e.relatedTarget)) {
            return
        }
        setIsOpen(false)
    }

    const handleFocus = () => {
        if (disabled) return

        if (!isOpen) {
            setIsOpen(true)
            justFocused.current = true

            setTimeout(() => {
                justFocused.current = false
            }, 200)
        }
    }

    const handleToggle = (e) => {
        if (disabled) return
        if (e.target.closest('.cancel-select')) return
        if (justFocused.current) return

        setIsOpen(prev => !prev)
    }

    const handleKeyDown = (e) => {
        if (e.key == 'Escape') {
            setIsOpen(false)
        }
    }

    return {
        handleBlur,
        handleFocus,
        handleToggle,
        handleKeyDown
    }
}

export default useSelect