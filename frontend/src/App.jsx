import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NotFoundPage, LogsViewPage, SettingsPage, AccountPage } from '@routes'
import { AppLayout } from '@components'

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<LogsViewPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}

export default App
