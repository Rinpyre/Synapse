import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AIPage, NotFoundPage, LogsViewPage, SettingsPage, AccountPage } from '@routes'
import { AppLayout } from '@components'

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<LogsViewPage />} />
                    <Route path="/ai" element={<AIPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}

export default App
