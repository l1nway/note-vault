import React from 'react'
import MDEditor from '@uiw/react-md-editor'

const MarkdownPreview = React.memo(function MarkdownPreview({content}) {
    return (
        <MDEditor.Markdown
            source={content}
            components={{
                a: ({children}) => (
                    <span className='fake-link'>{children}</span>
                )
            }}
        />
    )
})

export default MarkdownPreview