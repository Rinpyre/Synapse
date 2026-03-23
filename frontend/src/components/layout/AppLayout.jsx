import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function AppLayout({ children }) {
    return (
        <div className="app bg-primary flex h-screen w-full">
            <Sidebar />
            <div className="main-content flex-1 flex flex-col">
                <Topbar />
                <div className="flex w-full grow items-center justify-center overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    )
}