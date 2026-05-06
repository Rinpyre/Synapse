import { useState } from 'react'
import { MessageList, ChatInput } from '@components/features/aiChat'

export const AiChat = () => {
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSendMessage = async (content) => {
        // user message
        const userMessage = { role: 'user', content }
        setMessages((prev) => [...prev, userMessage])
        setError(null)
        setIsLoading(true)

        // Simulate API delay
        setTimeout(() => {
            try {
                // Mock response - replace with actual API call later
                const mockResponses = [
                    'That is an interesting question! Could you tell me more about what you are working on?',
                    'I understand. Let me think about that for a moment.',
                    'Great question! Here are a few things to consider.',
                    'I can help you with that. What specific aspect interests you?',
                    'Interesting perspective. Have you considered this approach?'
                ]

                const randomResponse =
                    mockResponses[Math.floor(Math.random() * mockResponses.length)]
                const aiMessage = { role: 'ai', content: randomResponse }

                setMessages((prev) => [...prev, aiMessage])
            } catch (err) {
                setError('Failed to send message. Please try again.')
                console.error('Chat error:', err)
            } finally {
                setIsLoading(false)
            }
        }, 1000)
    }

    return (
        <div className="ai-page bg-secondary border-border flex h-full w-full flex-col items-center gap-2 border-l p-4">
            <h2 className="text-snow border-border flex w-[80%] justify-center border-b pb-2 text-xl font-bold">
                Simon - AI Analytics Assistant
            </h2>
            <div className="flex w-full flex-1 flex-col">
                <div className="flex-1 overflow-y-auto pt-4">
                    <MessageList messages={messages} isLoading={isLoading} />
                </div>

                <div className="border-border border-t pt-4">
                    <ChatInput onSend={handleSendMessage} isDisabled={isLoading} error={error} />
                </div>
            </div>
        </div>
    )
}
