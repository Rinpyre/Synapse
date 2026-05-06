import { useEffect, useRef, useState } from 'react'
import { copyToClipboard } from '@utils'

export const CodeBlock = ({ code, language, isUser, renderedCode }) => {
    const [copied, setCopied] = useState(false)
    const timeoutRef = useRef(null)

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handleCopy = async () => {
        if (!code) {
            return
        }

        try {
            await copyToClipboard(code)
            setCopied(true)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => setCopied(false), 1500)
        } catch {
            setCopied(false)
        }
    }

    const headerClass = isUser ? 'bg-primary/10 text-primary/80' : 'bg-secondary/40 text-metadata'
    const borderClass = isUser ? 'border-primary/30' : 'border-border'
    const panelClass = isUser ? 'bg-primary/5' : 'bg-secondary/30'
    const buttonClass = isUser
        ? 'text-primary/80 hover:bg-primary/15'
        : 'text-metadata hover:bg-secondary/60'

    const displayCode = renderedCode ?? code

    return (
        <div className={`my-2 overflow-hidden rounded-md border ${borderClass}`}>
            <div className={`flex items-center justify-between px-3 py-1 text-xs ${headerClass}`}>
                <span className="font-semibold tracking-wide uppercase">{language || 'text'}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className={`rounded px-2 py-0.5 transition-colors ${buttonClass}`}
                    aria-label="Copy code"
                >
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className={`overflow-x-auto px-3 py-2 text-xs ${panelClass}`}>
                <code className="font-mono leading-relaxed whitespace-pre-wrap">{displayCode}</code>
            </pre>
        </div>
    )
}
