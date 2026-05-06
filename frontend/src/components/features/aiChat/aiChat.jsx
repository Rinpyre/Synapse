import { useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { MessageList, ChatInput } from '@components/features/aiChat'

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

    const getMessageText = (message) => {
        const text = message?.parts?.map((part) => (part.type === 'text' ? part.text : '')).join('')

        return text || message?.content || ''
    }

    const messages = chatMessages
        .filter((message) => message.role !== 'system')
        .map((message) => ({
            id: message.id,
            role: message.role,
            content: getMessageText(message)
        }))

    const isStreaming = status === 'streaming' || status === 'submitted'
    const showThinking =
        isStreaming && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant')
    const errorMessage =
        error?.message || (error ? 'Failed to send message. Please try again.' : null)
    const canRetry = Boolean(
        setMessages && (typeof regenerate === 'function' || typeof reload === 'function')
    )

    const handleSendMessage = (content) => {
        sendMessage({ text: content })
    }

    const handleRetryMessage = (messageId) => {
        if (!canRetry) {
            return
        }

        const targetIndex = chatMessages.findIndex((message) => message.id === messageId)
        if (targetIndex === -1) {
            return
        }

        const targetMessage = chatMessages[targetIndex]
        if (targetMessage?.role !== 'assistant') {
            return
        }

        const truncatedMessages = chatMessages.slice(0, targetIndex + 1)

        if (isStreaming) {
            stop?.()
        }

        setMessages(truncatedMessages)
        pendingRetryIdRef.current = targetMessage.id
    }

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

    return (
        <div className="ai-page bg-secondary border-border flex h-full min-h-0 w-full flex-col items-center gap-2 border-l p-4">
            <h2 className="text-snow border-border flex w-[80%] justify-center border-b pb-2 text-xl font-bold">
                Simon - AI Analytics Assistant
            </h2>
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
