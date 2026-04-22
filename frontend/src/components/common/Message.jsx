export const Message = ({ role, content, isLoading = false }) => {
    const isUser = role === 'user'

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    isUser ? 'bg-accent text-primary' : 'bg-secondary text-metadata'
                }`}
            >
                {isUser ? 'U' : 'AI'}
            </div>
            <div
                className={`max-w-2xl rounded-lg px-4 py-2 ${ 
                    isUser ? 'bg-accent text-primary rounded-br-none' : 'bg-secondary text-snow rounded-bl-none'}
                    ${isLoading ? 'animate-pulse' : ''}`}
            >
                <p className="break-words whitespace-pre-wrap text-sm">{content}</p>
            </div>
        </div>
    )
}
