import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function AppLayout({ children }) {
    return (
        <div className="app bg-primary flex h-screen w-full">
            <Sidebar />
            <div className="main-content flex-1 flex flex-col">
                <Topbar />
                <div className="flex w-full grow justify-center overflow-hidden">
                    <div className="content-view bg-secondary flex w-7xl h-180 rounded-4xl" >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}