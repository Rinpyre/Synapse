import { useEffect, useRef, useState } from 'react'
import { Check, Copy, RotateCcw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from './CodeBlock'
import { copyToClipboard } from '@utils'

const getTextFromNode = (node) => {
    if (node == null) {
        return ''
    }

    if (typeof node === 'string' || typeof node === 'number') {
        return String(node)
    }

    if (Array.isArray(node)) {
        return node.map(getTextFromNode).join('')
    }

    if (typeof node === 'object' && node.props) {
        return getTextFromNode(node.props.children)
    }

    return ''
}

const extractCodeInfo = (children) => {
    const child = Array.isArray(children) ? children[0] : children
    if (child && typeof child === 'object' && child.props) {
        const { className, children: childContent } = child.props
        const text = getTextFromNode(childContent).replace(/\n$/, '')
        const match = /language-([^\s]+)/.exec(className || '')
        return {
            code: text,
            language: match ? match[1] : null,
            className: className || '',
            renderedCode: childContent
        }
    }

    return {
        code: getTextFromNode(children).replace(/\n$/, ''),
        language: null,
        className: '',
        renderedCode: children
    }
}

const getMarkdownComponents = (isUser) => {
    const borderClass = isUser ? 'border-tertiary' : 'border-border'
    const headerClass = isUser ? 'bg-primary/10 text-primary/80' : 'bg-secondary/40 text-metadata'
    const divideClass = isUser ? 'divide-primary/20' : 'divide-border'
    const stripeClass = isUser ? 'odd:bg-black/10' : 'odd:bg-white/5'
    const inlineCodeClass = isUser
        ? 'border-primary/50 bg-primary/50 text-primary'
        : 'border-border bg-secondary/40 text-snow'
    const listClass =
        'my-2 space-y-1 pl-5 text-sm' + (isUser ? 'marker:text-primary' : 'marker:text-metadata')

    return {
        a: ({ children, href }) => (
            <a
                href={href}
                className="text-inherit underline decoration-current underline-offset-2 opacity-90 hover:opacity-100"
                rel="noreferrer"
                target="_blank"
            >
                {children}
            </a>
        ),
        table: ({ children }) => (
            <div className="w-full overflow-x-auto">
                <table className="w-full table-auto border-collapse text-left">{children}</table>
            </div>
        ),
        h1: ({ children }) => (
            <h1 className={`mt-3 mb-2 border-b-2 pb-1 ${borderClass}`}>{children}</h1>
        ),
        thead: ({ children }) => (
            <thead className={`text-xs uppercase ${headerClass}`}>{children}</thead>
        ),
        tbody: ({ children }) => <tbody className={`divide-y ${divideClass}`}>{children}</tbody>,
        tr: ({ children }) => <tr className={stripeClass}>{children}</tr>,
        th: ({ children }) => (
            <th className={`border px-2 py-1 font-semibold whitespace-nowrap ${borderClass}`}>
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className={`border px-2 py-1 align-top ${borderClass}`}>{children}</td>
        ),
        pre: ({ children }) => {
            const { code, language, renderedCode } = extractCodeInfo(children)
            return (
                <CodeBlock
                    code={code}
                    language={language}
                    isUser={isUser}
                    renderedCode={renderedCode}
                />
            )
        },
        code: ({ className, children }) => {
            const text = getTextFromNode(children)
            const isInline = !className && !text.includes('\n')

            if (!isInline) {
                return <code className={className}>{children}</code>
            }

            return (
                <code className={`rounded border px-1 py-0.5 font-mono text-xs ${inlineCodeClass}`}>
                    {text}
                </code>
            )
        },
        ul: ({ children }) => <ul className={`list-disc ${listClass}`}>{children}</ul>,
        ol: ({ children }) => <ol className={`list-decimal ${listClass}`}>{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        hr: () => <hr className={`my-4 border ${borderClass}`} />,
        blockquote: ({ children }) => (
            <blockquote
                className={`border-accent border-l-2 p-1 pl-2.5 opacity-90 ${
                    isUser ? 'bg-accent/10' : 'bg-secondary/40'
                }`}
            >
                {children}
            </blockquote>
        )
    }
}

export const Message = ({
    role,
    content,
    isLoading = false,
    messageId,
    onRetry,
    canRetry = false
}) => {
    const isUser = role === 'user'
    const isAssistant = role === 'assistant'
    const [copied, setCopied] = useState(false)
    const timeoutRef = useRef(null)
    const markdownComponents = getMarkdownComponents(isUser)

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handleCopyMessage = async () => {
        if (!content) {
            return
        }

        try {
            await copyToClipboard(content)
            setCopied(true)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => setCopied(false), 1500)
        } catch {
            setCopied(false)
        }
    }

    const handleRetryMessage = () => {
        if (!onRetry || !messageId) {
            return
        }

        onRetry(messageId)
    }

    const retryDisabled = isLoading || !canRetry

    return (
        <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isUser ? 'bg-accent text-primary' : 'bg-tertiary text-metadata'
                }`}
            >
                {isUser ? 'U' : 'AI'}
            </div>
            <div className={`flex w-full flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`max-w-[90%] overflow-x-auto rounded-lg px-4 py-2 ${
                        isUser
                            ? 'bg-accent-dark text-snow rounded-br-none'
                            : 'bg-tertiary text-snow rounded-bl-none'
                    } ${isLoading ? 'animate-pulse' : ''}`}
                >
                    <div className="text-sm wrap-break-word">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeSanitize, rehypeKatex, rehypeHighlight]}
                            components={markdownComponents}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
                <div
                    className={`mt-2 flex items-center gap-1 ${
                        isUser ? 'justify-end' : 'justify-start'
                    }`}
                >
                    {isAssistant && onRetry && (
                        <button
                            type="button"
                            onClick={handleRetryMessage}
                            className="text-metadata hover:bg-tertiary/60 rounded p-1 transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Retry response"
                            title="Retry response"
                            disabled={retryDisabled}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleCopyMessage}
                        className={`text-metadata hover:bg-tertiary/60 rounded p-1 transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                        aria-label={copied ? 'Copied' : 'Copy message'}
                        title={copied ? 'Copied' : 'Copy message'}
                        disabled={!content || isLoading}
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
