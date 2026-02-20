import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage, NotFoundPage } from '@routes'

function App() {
    return (
        <BrowserRouter>
            <div className="app bg-primary flex h-screen w-full">
                <div className="flex w-full grow items-center justify-center overflow-hidden">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    )
}

export default App
