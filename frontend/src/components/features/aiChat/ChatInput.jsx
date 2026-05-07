import { useState, useRef, useEffect } from 'react'
import { ArrowUp as SendIcon, CircleStop as StopIcon, AlertCircle as AlertIcon } from 'lucide-react'
import { cn } from '@utils'

export const ChatInput = ({
    onSend,
    onStop,
    isDisabled = false,
    isGenerating = false,
    error = null
}) => {
    const [input, setInput] = useState('')
    const textareaRef = useRef(null)

    const canSend = !isDisabled && input.trim()
    const showStop = isGenerating

    const refocusInput = () => {
        textareaRef.current?.focus()
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = input.trim()
        if (!trimmed || isDisabled) {
            return
        }

        onSend(trimmed)
        setInput('')
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
        requestAnimationFrame(refocusInput)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleStop = () => {
        if (!showStop) {
            return
        }

        onStop?.()
        requestAnimationFrame(refocusInput)
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
                    <AlertIcon size={16} />
                    <span className="text-sm">{error}</span>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what to analyze"
                    className="border-border bg-secondary text-snow placeholder-metadata focus:border-accent scroll-none flex-1 resize-none overflow-y-auto rounded-lg border px-4 py-1.5 outline-none disabled:opacity-50"
                    rows={1}
                />
                <button
                    type={showStop ? 'button' : 'submit'}
                    onClick={showStop ? handleStop : undefined}
                    disabled={showStop ? !onStop : !canSend}
                    className={cn(
                        'text-primary flex items-center justify-center rounded-lg p-2 transition-colors hover:cursor-pointer disabled:cursor-not-allowed',
                        showStop
                            ? 'bg-error hover:bg-error/80 disabled:opacity-60'
                            : 'bg-accent hover:bg-accent-light disabled:bg-accent-dark'
                    )}
                    aria-label={showStop ? 'Stop generating' : 'Send message'}
                    title={showStop ? 'Stop generating' : 'Send message'}
                >
                    {showStop ? <StopIcon size={18} /> : <SendIcon size={20} />}
                </button>
            </form>
        </div>
    )
}
