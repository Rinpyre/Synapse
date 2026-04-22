import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage, AIPage, LogsViewPage, SettingsPage, AccountPage, NotFoundPage } from '@routes'
import { AppLayout } from '@components'

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/ai" element={<AIPage />} />
                    <Route path="/logs" element={<LogsViewPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}

export default App
