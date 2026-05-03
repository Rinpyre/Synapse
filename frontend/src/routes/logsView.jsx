import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { DataTable, AiChat } from '@components/features'

export const LogsViewPage = () => {
    const defaultPerPage = 15
    const [query, setQuery] = useState('')
    const timeoutRef = useRef(null)
    const [data, setData] = useState({ rows: [], columns: [] })
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: defaultPerPage,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const updateBrowserUrl = useCallback(({ queryValue, page, perPage }) => {
        const url = new URL(window.location)
        if (queryValue) {
            url.searchParams.set('q', queryValue)
        } else {
            url.searchParams.delete('q')
        }

        if (page && page > 1) {
            url.searchParams.set('page', page)
        } else {
            url.searchParams.delete('page')
        }

        if (perPage) {
            url.searchParams.set('per_page', perPage)
        } else {
            url.searchParams.delete('per_page')
        }

        window.history.replaceState(null, '', url)
    }, [])

    const fetchLogs = useCallback(
        async ({ queryValue = '', page = 1, perPage = defaultPerPage } = {}) => {
            setLoading(true)
            setError('')
            updateBrowserUrl({ queryValue, page, perPage })

            const apiUrl = new URL('/api/logs', 'http://localhost:8000')
            if (queryValue) {
                apiUrl.searchParams.set('filters', queryValue)
            }
            if (page && page > 1) {
                apiUrl.searchParams.set('page', page)
            }
            if (perPage) {
                apiUrl.searchParams.set('per_page', perPage)
            }

            try {
                const response = await fetch(apiUrl)
                if (!response.ok) {
                    throw new Error(response.statusText || 'Failed to fetch logs.')
                }

                const payload = await response.json()
                const rows = payload.rows
                const pageInfo = payload.pagination
                const total = pageInfo.total
                const resolvedPerPage = pageInfo.per_page
                const resolvedPage = pageInfo.current_page
                const lastPage = pageInfo.last_page
                const from = total > 0 ? (resolvedPage - 1) * resolvedPerPage + 1 : 0
                const to = total > 0 ? (resolvedPage - 1) * resolvedPerPage + rows.length : 0

                setData({
                    rows,
                    columns: payload.columns
                })
                setPagination({
                    ...pageInfo,
                    last_page: lastPage,
                    from,
                    to
                })
            } catch (fetchError) {
                console.error('Fetch error:', fetchError)
                setError(fetchError?.message || 'Failed to fetch logs.')
            } finally {
                setLoading(false)
            }
        },
        [defaultPerPage, updateBrowserUrl]
    )

    const onChange = (event) => {
        const value = event.target.value
        setQuery(value)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            setPagination((prev) => ({ ...prev, current_page: 1 }))
            fetchLogs({ queryValue: value, page: 1, perPage: pagination.per_page })
        }, 500)
    }

    const handlePageChange = (nextPage) => {
        if (nextPage === pagination.current_page) return
        setPagination((prev) => ({ ...prev, current_page: nextPage }))
        fetchLogs({ queryValue: query, page: nextPage, perPage: pagination.per_page })
    }

    const handlePerPageChange = (nextPerPage) => {
        setPagination((prev) => ({ ...prev, per_page: nextPerPage, current_page: 1 }))
        fetchLogs({ queryValue: query, page: 1, perPage: nextPerPage })
    }

    useEffect(() => {
        fetchLogs({ queryValue: '', page: 1, perPage: defaultPerPage })
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [defaultPerPage, fetchLogs])

    return (
        <div className="logs-view-container flex h-full w-full">
            <div className="logs-view-page flex h-full flex-1 flex-col items-center justify-end gap-2 p-8 pt-1.5">
                <h2 className="text-snow flex grow items-center p-4 text-2xl font-bold">
                    AI Logs Analyzer
                </h2>

                <div
                    className="border-border bg-secondary focus-within:border-accent flex w-full cursor-text items-center gap-2 rounded border px-3 py-2"
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
                                setPagination((prev) => ({ ...prev, current_page: 1 }))
                                fetchLogs({ queryValue: '', page: 1, perPage: pagination.per_page })
                            }}
                            className="text-metadata hover:text-accent flex h-6 w-6 items-center justify-center rounded transition-colors"
                            title="Clear search"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <DataTable
                    rows={data.rows}
                    columns={data.columns}
                    limit={defaultPerPage}
                    loading={loading}
                    error={error}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
            <div className="ai-sidebar w-1/4">
                <AiChat />
            </div>
        </div>
    )
}
