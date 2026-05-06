import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { MessageList, ChatInput } from '@components/features/aiChat'

export const AiChat = () => {
    const {
        messages: chatMessages,
        sendMessage,
        status,
        stop,
        error
    } = useChat({
        transport: new DefaultChatTransport({
            api: 'http://localhost:8001/api/chat'
        })
    })

    const messages = chatMessages
        .filter((message) => message.role !== 'system')
        .map((message) => ({
            role: message.role,
            content:
                message.parts?.map((part) => (part.type === 'text' ? part.text : '')).join('') ??
                message.content ??
                ''
        }))

    const isStreaming = status === 'streaming' || status === 'submitted'
    const showThinking =
        isStreaming && (messages.length === 0 || messages[messages.length - 1].role !== 'assistant')
    const errorMessage =
        error?.message || (error ? 'Failed to send message. Please try again.' : null)

    const handleSendMessage = (content) => {
        sendMessage({ text: content })
    }

    return (
        <div className="ai-page bg-secondary border-border flex h-full min-h-0 w-full flex-col items-center gap-2 border-l p-4">
            <h2 className="text-snow border-border flex w-[80%] justify-center border-b pb-2 text-xl font-bold">
                Simon - AI Analytics Assistant
            </h2>
            <div className="flex min-h-0 w-full flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col">
                    <MessageList messages={messages} isLoading={showThinking} />
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
