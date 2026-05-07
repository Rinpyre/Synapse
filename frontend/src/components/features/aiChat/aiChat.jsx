import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { MessageList, ChatInput } from '@components/features/aiChat'
import { SquarePen as NewChatIcon, Clipboard as CopyChatIcon, Check } from 'lucide-react'
import { copyToClipboard } from '@utils'

export const AiChat = () => {
    const {
        messages: chatMessages,
        sendMessage,
        status,
        stop,
        error,
        setMessages,
        reload,
        regenerate
    } = useChat({
        transport: new DefaultChatTransport({
            api: 'http://localhost:8001/api/chat'
        })
    })

    const pendingRetryIdRef = useRef(null)
    const [copied, setCopied] = useState(false)
    const timeoutRef = useRef(null)

    const getMessageText = useCallback((message) => {
        const text = message?.parts?.map((part) => (part.type === 'text' ? part.text : '')).join('')

        return text || message?.content || ''
    }, [])

    const messages = useMemo(() => {
        return chatMessages
            .filter((message) => message.role !== 'system')
            .map((message) => ({
                id: message.id,
                role: message.role,
                content: getMessageText(message)
            }))
    }, [chatMessages, getMessageText])

    const isStreaming = status === 'streaming' || status === 'submitted'
    const showThinking =
        isStreaming && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant')
    const errorMessage =
        error?.message || (error ? 'Failed to send message. Please try again.' : null)
    const canRetry = Boolean(
        setMessages && (typeof regenerate === 'function' || typeof reload === 'function')
    )
    const chatMessagesRef = useRef(chatMessages)
    const isStreamingRef = useRef(isStreaming)
    const canRetryRef = useRef(canRetry)

    useEffect(() => {
        chatMessagesRef.current = chatMessages
        isStreamingRef.current = isStreaming
        canRetryRef.current = canRetry
    }, [chatMessages, isStreaming, canRetry])

    const handleSendMessage = (content) => {
        sendMessage({ text: content })
    }

    const handleRetryMessage = useCallback(
        (messageId) => {
            if (!canRetryRef.current) {
                return
            }

            const currentMessages = chatMessagesRef.current
            const targetIndex = currentMessages.findIndex((message) => message.id === messageId)
            if (targetIndex === -1) {
                return
            }

            const targetMessage = currentMessages[targetIndex]
            if (targetMessage?.role !== 'assistant') {
                return
            }

            const truncatedMessages = currentMessages.slice(0, targetIndex + 1)

            if (isStreamingRef.current) {
                stop?.()
            }

            setMessages(truncatedMessages)
            pendingRetryIdRef.current = targetMessage.id
        },
        [setMessages, stop]
    )

    useEffect(() => {
        const pendingRetryId = pendingRetryIdRef.current
        if (!pendingRetryId) {
            return
        }

        const lastMessage = chatMessages[chatMessages.length - 1]
        if (!lastMessage || lastMessage.id !== pendingRetryId) {
            return
        }

        if (typeof regenerate === 'function') {
            regenerate()
        } else if (typeof reload === 'function') {
            reload()
        }

        pendingRetryIdRef.current = null
    }, [chatMessages, regenerate, reload])

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handleCopyMessage = async (content) => {
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

    return (
        <div className="ai-page bg-secondary border-border flex h-full min-h-0 w-full flex-col items-center gap-2 border-l p-4">
            <div className="flex w-full justify-between pb-2">
                <h2 className="text-snow text-xl font-bold">Simon</h2>
                <div className="actions flex gap-1">
                    <button
                        type="button"
                        onClick={() => {
                            const textToCopy = messages
                                .map(
                                    (msg) =>
                                        `${msg.role === 'user' ? 'User' : 'Synapse AI'}:\n"${msg.content}"`
                                )
                                .join('\n\n')
                            handleCopyMessage(textToCopy)
                        }}
                        title="Copy chat to clipboard"
                        className="action-btn text-metadata hover:bg-tertiary/60 cursor-pointer rounded-md p-1.5 transition-colors"
                    >
                        {copied ? (
                            <Check size={18} className="text-green-500" />
                        ) : (
                            <CopyChatIcon size={18} />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMessages([])}
                        title="New chat"
                        className="action-btn text-metadata hover:bg-tertiary/60 cursor-pointer rounded-md p-1.5 transition-colors"
                    >
                        <NewChatIcon size={18} />
                    </button>
                </div>
            </div>
            <div className="flex min-h-0 w-full flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col">
                    <MessageList
                        messages={messages}
                        isLoading={showThinking}
                        onRetry={handleRetryMessage}
                        canRetry={canRetry}
                    />
                </div>

                <div className="pt-1">
                    <ChatInput
                        onSend={handleSendMessage}
                        onStop={stop}
                        isDisabled={status !== 'ready'}
                        isGenerating={isStreaming}
                        error={errorMessage}
                    />
                </div>
            </div>
        </div>
    )
}
