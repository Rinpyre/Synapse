import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage, LogsViewPage, SettingsPage, AccountPage, NotFoundPage, QueryPage } from '@routes'
import { AppLayout } from '@components'

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/logs" element={<LogsViewPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/query" element={<QueryPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}

export default App
