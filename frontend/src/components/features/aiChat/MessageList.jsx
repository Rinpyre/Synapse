import { useEffect, useRef } from 'react'
import { Message } from './Message'

export const MessageList = ({ messages, isLoading = false, onRetry, canRetry = false }) => {
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    return (
        <div className="scroll-none flex h-full min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-4">
            {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                    <div className="text-metadata">
                        <p className="text-lg font-semibold">Start a conversation</p>
                        <p className="text-sm">Type a message below to begin</p>
                    </div>
                </div>
            ) : (
                <>
                    {messages.map((msg, idx) => (
                        <Message
                            key={msg.id ?? idx}
                            role={msg.role}
                            content={msg.content}
                            messageId={msg.id}
                            onRetry={msg.id ? onRetry : null}
                            canRetry={canRetry && Boolean(msg.id)}
                        />
                    ))}
                    {isLoading && <Message role="ai" content="Thinking..." isLoading={true} />}
                </>
            )}
            <div ref={endRef} />
        </div>
    )
}
