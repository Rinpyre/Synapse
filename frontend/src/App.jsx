import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage, NotFoundPage } from '@routes'
import AppLayout from '@components/layout/AppLayout'

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}

export default App