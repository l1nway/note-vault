import {useHotkeys} from 'react-hotkeys-hook'
import {useCallback} from 'react'

function Hotkey({
    keys,
    onTrigger,
    enabled = true,
    scope,
    preventDefault = true,
}) 
{
    const handler = useCallback(
        (event) => {
        if (preventDefault) {
            event.preventDefault()
            event.stopPropagation()
        }
        onTrigger(event)
    }, [onTrigger, preventDefault]
  )

    useHotkeys(keys, handler, {
        enabled,
        scopes: scope ? [scope] : undefined,

        keydown: true,
        enableOnFormTags: true,
    })

  return null
}

export default Hotkey
