import { useState, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { DataTable, AiChat } from '@components/features'
import { multiplyRows } from '@utils'
import TestData from '@assets/dummyData.json'

export const LogsViewPage = () => {
    const [query, setQuery] = useState('')
    const timeoutRef = useRef(null)
    const [data, setData] = useState({
        rows: multiplyRows(TestData.rows, 100),
        columns: TestData.columns
    })

    const searchQuery = async (queryValue) => {
        const url = new URL(window.location)
        if (queryValue) {
            url.searchParams.set('filters', queryValue)
        } else {
            url.searchParams.delete('filters')
        }
        window.history.replaceState(null, '', url)

        try {
            const response = await fetch(url)
            if (!response.ok) {
                console.error('Server error:', response.statusText)
                return
            }
            const data = await response.json()
            setData({ rows: data.rows, columns: data.columns })
        } catch (error) {
            console.error('Fetch error:', error)
        }
    }

    const onChange = (event) => {
        const value = event.target.value
        setQuery(value)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            searchQuery(value)
        }, 500)
    }

    return (
        <div className="logs-view-container flex h-full w-full">
            <div className="logs-view-page flex h-full flex-1 flex-col items-center justify-end gap-2 p-8 pt-1.5">
                <h2 className="text-snow flex grow items-center p-4 text-2xl font-bold">
                    AI Logs Analyzer
                </h2>

                <div
                    className="border-border bg-secondary flex w-full cursor-text items-center gap-2 rounded border px-3 py-2"
                    onClick={
                        // Focus the input when clicking the container
                        () => {
                            const input = document.getElementById('queryTextarea')
                            if (input) input.focus()
                        }
                    }
                >
                    <Search className="text-metadata h-5 w-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={onChange}
                        id="queryTextarea"
                        className="text-snow placeholder-metadata flex-1 bg-transparent outline-none"
                        placeholder="Filter by keyword or field"
                    />
                    {query && (
                        <button
                            onClick={() => {
                                setQuery('')
                                searchQuery('')
                            }}
                            className="text-metadata hover:text-accent flex h-6 w-6 items-center justify-center rounded transition-colors"
                            title="Clear search"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <DataTable rows={data.rows} columns={data.columns} limit={15} />
            </div>
            <div className="ai-sidebar w-1/4">
                <AiChat />
            </div>
        </div>
    )
}
