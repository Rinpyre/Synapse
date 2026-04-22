import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Home,
    MessageCircle as AI,
    Logs,
    Bolt as Settings,
    CircleUser as Account,
    PanelRightOpen as ToggleBtnOpen,
    PanelRightClose as ToggleBtnClose
} from 'lucide-react'

const items = [
    { label: 'Home', icon: Home, route: '/' },
    { label: 'Logs', icon: Logs, route: '/logs' },
    { label: 'devider' },
    { label: 'AI', icon: AI, route: '/ai' },
    { label: 'space' },
    { label: 'Settings', icon: Settings, route: '/settings' },
    { label: 'Account', icon: Account, route: '/account' }
]

export const Sidebar = ({ open = false }) => {
    const [isOpen, setIsOpen] = useState(open)

    return (
        <div
            className={`group/sidebar bg-secondary relative h-full ${isOpen ? 'w-60' : 'w-17'} transition-width flex items-center justify-center duration-300`}
        >
            <div className="menu flex h-full w-full flex-col items-start justify-start gap-2 p-4">
                {items.map((item, index) => {
                    if (item.label === 'devider') {
                        return <hr key={index} className="border-snow/20 w-full" />
                    }
                    if (item.label === 'space') {
                        return <div key={index} className="grow" />
                    }
                    const Icon = item.icon
                    return (
                        <Link
                            title={item.label}
                            key={index}
                            to={item.route}
                            className="text-snow hover:bg-snow/20 flex w-full items-center gap-4 rounded-lg p-2"
                        >
                            <Icon size={20} />
                            {isOpen && <span>{item.label}</span>}
                        </Link>
                    )
                })}
                <div
                    className="toggle border-snow/50 text-snow absolute right-0 bottom-0 h-full cursor-pointer border-r p-2 opacity-0 transition-opacity hover:opacity-100"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? (
                        <ToggleBtnOpen
                            size={20}
                            className="absolute top-1/2 -right-2 -translate-y-1/2 cursor-pointer"
                        />
                    ) : (
                        <ToggleBtnClose
                            size={20}
                            className="absolute top-1/2 -right-2 -translate-y-1/2 cursor-pointer"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
