export const copyToClipboard = async (text) => {
    if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
}
