import { useEffect, useRef } from 'react'
import { Message } from './Message'

export const MessageList = ({ messages, isLoading = false }) => {
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    return (
        <div className="flex flex-col gap-4 overflow-y-auto pr-4">
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
                        <Message key={idx} role={msg.role} content={msg.content} />
                    ))}
                    {isLoading && <Message role="ai" content="Thinking..." isLoading={true} />}
                </>
            )}
            <div ref={endRef} />
        </div>
    )
}
