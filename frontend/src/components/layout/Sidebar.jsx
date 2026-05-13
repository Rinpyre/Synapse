import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Bolt as Settings,
    DatabaseSearch as Query,
    CircleUser as Account,
    PanelRightOpen as ToggleBtnOpen,
    PanelRightClose as ToggleBtnClose
} from 'lucide-react'
import logo from '@assets/logo.svg'

const items = [
    { label: 'Synapse', route: '/' },
    { label: 'devider' },
    { label: 'Logs', icon: Query, route: '/' },
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
            <div className="menu flex h-full w-full flex-col items-start justify-start gap-2 p-3">
                {items.map((item, index) => {
                    if (item.label === 'devider') {
                        return <hr key={index} className="border-snow/20 w-full" />
                    }
                    if (item.label === 'space') {
                        return <div key={index} className="grow" />
                    }
                    if (item.label === 'Synapse') {
                        return (
                            <Link
                                title="Synapse"
                                key={index}
                                to={item.route}
                                className="text-accent-dark flex w-full items-center justify-center transition-opacity duration-300"
                            >
                                <img src={logo} alt="Logo" className="h-10 w-10" />
                                <span
                                    className={`ml-2 text-2xl font-bold transition-opacity duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}
                                >
                                    Synapse
                                </span>
                            </Link>
                        )
                    }
                    const Icon = item.icon
                    return (
                        <Link
                            title={item.label}
                            key={index}
                            to={item.route}
                            className="text-snow hover:bg-snow/10 flex w-full items-center gap-3 rounded-md px-3 py-2 transition-colors"
                        >
                            <Icon size={20} className="shrink-0" />
                            <span
                                className={`text-snow transition-opacity duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}
                            >
                                {item.label}
                            </span>
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
