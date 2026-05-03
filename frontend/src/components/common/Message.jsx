export const Message = ({ role, content, isLoading = false }) => {
    const isUser = role === 'user'

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isUser ? 'bg-accent text-primary' : 'bg-tertiary text-metadata'
                }`}
            >
                {isUser ? 'U' : 'AI'}
            </div>
            <div
                className={`max-w-2xl rounded-lg px-4 py-2 ${
                    isUser
                        ? 'bg-accent text-primary rounded-br-none'
                        : 'bg-tertiary text-snow rounded-bl-none'
                } ${isLoading ? 'animate-pulse' : ''}`}
            >
                <p className="text-sm wrap-break-word whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    )
}
