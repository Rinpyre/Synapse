import { Sidebar, Topbar } from '@components'

export default function AppLayout({ children }) {
    return (
        <div className="app bg-primary flex h-screen w-full">
            <Sidebar />
            <div className="main-content flex grow flex-col">
                <Topbar />
                {children}
            </div>
        </div>
    )
}
