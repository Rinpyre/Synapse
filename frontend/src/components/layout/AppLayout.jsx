import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function AppLayout({ children }) {
    return (
        <div className="app bg-primary flex h-screen w-full">
            <Sidebar />
            <div className="main-content grow flex flex-col">
                <Topbar />
                {children}
            </div>
        </div>
    )
}