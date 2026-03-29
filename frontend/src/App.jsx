import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage, NotFoundPage } from '@routes'
import { AppLayout } from '@components'
import { LogTable } from '@components'

function App() {
    return (
        <BrowserRouter>
            <AppLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/logs"
                        element={
                            <LogTable
                                rows={[
                                    {
                                        id: 35517,
                                        timestamp: '2026-01-27T12:47:05.4666667',
                                        actor: 'StudentProfilePage',
                                        entityType: 'Student',
                                        action: 'Student shown'
                                    },
                                    {
                                        id: 35516,
                                        timestamp: '2026-01-27T12:46:50.2833333',
                                        actor: 'StudentProfilePage',
                                        entityType: 'Student',
                                        action: 'Student shown'
                                    },
                                    {
                                        id: 35515,
                                        timestamp: '2026-01-27T12:46:40.0100000',
                                        actor: 'SchoolProfilePage',
                                        entityType: 'School',
                                        action: 'School shown'
                                    },
                                    {
                                        id: 35514,
                                        timestamp: '2026-01-27T12:46:29.8866667',
                                        actor: 'SchoolProfilePage',
                                        entityType: 'School',
                                        action: 'School shown'
                                    },
                                    {
                                        id: 35513,
                                        timestamp: '2026-01-27T13:45:39.4000000',
                                        actor: 'LoginSystem',
                                        entityType: 'User',
                                        action: 'Niklas SpeedAdmin ApS speedadmin medarbetare har loggat in. (10.200.36.50)'
                                    },
                                    {
                                        id: 35512,
                                        timestamp: '2026-01-27T13:45:39.3000000',
                                        actor: 'LoginSystem',
                                        entityType: 'User',
                                        action: 'Owl SpeedAdmin ApS speedadmin medarbetare har loggat in.'
                                    }
                                ]}
                                columns={[
                                    { ID: 'id of the user' },
                                    { Timestamp: 'timestamp of the log entry' },
                                    { Actor: 'the actor involved' },
                                    { 'Entity Type': 'the type of entity' },
                                    { Action: 'the action performed' }
                                ]}
                            />
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AppLayout>
        </BrowserRouter>
    )
}

export default App
