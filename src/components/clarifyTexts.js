
// the note and notes pages have the same calls, but different pathnames. to avoid copy-pasting, i combined them into one state
const noteGeneral = {
    delete: {
        title: 'Delete note',
        desc: 'Are you sure you want to delete this note?',
        button: 'delete'
    },
    archive: {
        title: 'Archive note',
        desc: 'Are you sure you want to archive this note?',
        button: 'archive'
    },
    unarchive: {
        title: 'Unarchive note',
        desc: 'Are you sure want to unarchive this note?',
        button: 'unarchive'
    },
    force: {
        title: 'Permanently delete note',
        desc: 'Are you sure want to permanently delete this note? This action cannot be undone.',
        button: 'delete'
    },
    restore: {
        title: 'Restore note',
        desc: 'Are you sure want to restore this note?',
        button: 'restore'
    }
}

// state with storage of titles, descriptions, and buttons
export const clarifyValue = {
    'categories': {
        'new':
            {
                title: 'New category',
                desc: 'Category name',
                button: 'create'
            },
        'edit': 
            {
                title: 'Edit category',
                desc: 'Category name',
                button: 'save'
            },
        'delete': 
            {
                title: 'Delete category',
                desc: 'Are you sure you want to delete this category? This action cannot be undone.',
                button: 'delete'
            }},

    'tags': {
        'new':
            {
                title: 'New tag',
                desc: 'Tag name',
                button: 'create'
            },
        'edit': 
            {
                title: 'Edit tag',
                desc: 'Tag name',
                button: 'save'
            },
        'delete': 
            {
                title: 'Delete tag',
                desc: 'Are you sure you want to delete this tag? This action cannot be undone.',
                button: 'delete'
            }},
        'notes': noteGeneral,
        'notes/note': noteGeneral
    }