import { useState, useRef, useEffect } from 'react'
import { Send, AlertCircle } from 'lucide-react'

export const ChatInput = ({ onSend, isDisabled = false, error = null }) => {
    const [input, setInput] = useState('')
    const textareaRef = useRef(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (input.trim() && !isDisabled) {
            onSend(input.trim())
            setInput('')
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
        }
    }, [input])

    return (
        <div className="flex flex-col gap-2">
            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-error">
                    <AlertCircle size={16} />
                    <span className="text-sm">{error}</span>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    placeholder="Type your question here..."
                    className="flex-1 resize-none overflow-hidden rounded-lg border border-border bg-secondary px-4 py-2 text-snow placeholder-metadata disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0"
                    rows={1}
                />
                <button
                    type="submit"
                    disabled={isDisabled || !input.trim()}
                    className="bg-accent hover:bg-accent-light disabled:bg-accent-dark flex items-center justify-center rounded-lg p-2 text-primary transition-colors"
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    )
}
