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
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 120) + 'px'
        }
    }, [input])

    return (
        <div className="flex flex-col gap-2">
            {error && (
                <div className="bg-error/10 text-error flex items-center gap-2 rounded-lg px-3 py-2">
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
                    placeholder="Describe what to analyze"
                    className="border-border bg-secondary text-snow placeholder-metadata focus:border-accent flex-1 resize-none overflow-hidden rounded-lg border px-4 py-1.5 outline-none disabled:opacity-50"
                    rows={1}
                />
                <button
                    type="submit"
                    disabled={isDisabled || !input.trim()}
                    className="bg-accent hover:bg-accent-light disabled:bg-accent-dark text-primary flex items-center justify-center rounded-lg p-2 transition-colors"
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    )
}
