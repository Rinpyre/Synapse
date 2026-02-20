import { useNavigate } from 'react-router-dom'

export const NotFoundPage = () => {
    const navigate = useNavigate()
    const location = window.location.pathname

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="mt-2 text-lg text-gray-400">Page `{location}` not found.</p>
            <div className="mt-6 max-w-md text-center">
                <p className="text-sm text-gray-500">
                    This website is currently in active development. Some pages may not be available
                    yet.
                </p>
            </div>
            <button
                onClick={() => navigate('/')}
                className="bg-accent hover:bg-accent-dark text-snow mt-8 rounded px-4 py-2 transition-colors hover:cursor-pointer"
            >
                Go Home
            </button>
        </div>
    )
}
