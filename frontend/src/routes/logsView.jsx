import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { DataTable, AiChat } from '@components/features'

export const LogsViewPage = () => {
    const defaultPerPage = 15
    const logsDebounceMs = 500
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [suggestionPosition, setSuggestionPosition] = useState({
        left: 0,
        top: 0,
        placement: 'bottom'
    })
    const containerRef = useRef(null)
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)
    const logsTimeoutRef = useRef(null)
    const blurTimeoutRef = useRef(null)
    const suggestionContextRef = useRef(null)
    const suggestionRequestIdRef = useRef(0)
    const suggestionItemRefs = useRef([])
    const textMeasureCanvasRef = useRef(null)
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

    const getSuggestionContext = useCallback((queryValue, cursorPosition) => {
        const safeQuery = typeof queryValue === 'string' ? queryValue : ''
        const safeCursor = Number.isInteger(cursorPosition) ? cursorPosition : safeQuery.length
        const clampedCursor = Math.min(Math.max(safeCursor, 0), safeQuery.length)
        const textBeforeCursor = safeQuery.slice(0, clampedCursor)
        const textAfterCursor = safeQuery.slice(clampedCursor)
        const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ')
        const nextSpaceIndex = textAfterCursor.indexOf(' ')
        const startIndex = lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1
        const endIndex = nextSpaceIndex === -1 ? safeQuery.length : clampedCursor + nextSpaceIndex
        const currentSegment = safeQuery.slice(startIndex, endIndex)

        let field = null
        let value = currentSegment

        if (currentSegment.includes(':')) {
            const [fieldPart, ...valueParts] = currentSegment.split(':')
            field = fieldPart
            value = valueParts.join(':')
        }

        return {
            startIndex,
            endIndex,
            currentSegment,
            field,
            value,
            cursorPosition: clampedCursor
        }
    }, [])

    const measureTextWidth = useCallback((text, font) => {
        if (!textMeasureCanvasRef.current) {
            textMeasureCanvasRef.current = document.createElement('canvas')
        }

        const context = textMeasureCanvasRef.current.getContext('2d')
        if (!context) return 0

        context.font = font
        return context.measureText(text).width
    }, [])

    const updateSuggestionPosition = useCallback(() => {
        const context = suggestionContextRef.current
        const input = inputRef.current
        const container = containerRef.current

        if (!context || !input || !container) return

        const inputRect = input.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(input)
        const font = computedStyle.font || `${computedStyle.fontSize} ${computedStyle.fontFamily}`
        const textBeforeCaret = context.queryValue.slice(0, context.cursorPosition)
        const textWidth = measureTextWidth(textBeforeCaret, font)
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
        const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0
        const caretX =
            inputRect.left + paddingLeft + borderLeft + textWidth - (input.scrollLeft || 0)

        const dropdownWidth = dropdownRef.current?.offsetWidth || 256
        const dropdownHeight = dropdownRef.current?.offsetHeight || 200
        const margin = 8
        const maxLeft = window.innerWidth - dropdownWidth - margin
        const clampedLeft = Math.min(Math.max(caretX, margin), maxLeft)
        const relativeLeft = Math.max(
            0,
            Math.min(clampedLeft - containerRect.left, containerRect.width - dropdownWidth)
        )

        const spaceBelow = window.innerHeight - inputRect.bottom
        let top = inputRect.bottom + margin
        let placement = 'bottom'

        if (spaceBelow < dropdownHeight + margin) {
            top = inputRect.top - dropdownHeight - margin
            placement = 'top'
        }

        const relativeTop = top - containerRect.top

        setSuggestionPosition({
            left: relativeLeft,
            top: relativeTop,
            placement
        })
    }, [measureTextWidth])

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

    const fetchSuggestions = useCallback(
        async ({ queryValue = '', cursorPosition = null } = {}) => {
            const apiUrl = new URL('/api/suggestions', 'http://localhost:8000')

            // Get where the user is currently focused in the query input to provide suggestions for that specific tag or value they are typing
            // To get suggestions we will send a post request with the tag and the value they are currently typing, for example if they are typing "status:erro" we will send { field: "status", value: "erro" } to the backend to get suggestions for the status tag with the value "erro"
            // It should work even if they are editing in the middle of the query, for example if they have "status:error method:GET" and they are currently editing the "status:error" part, we should still be able to extract that they are editing the "status" tag with the value "error" and provide suggestions for that

            const input = inputRef.current
            const resolvedCursorPosition = Number.isInteger(cursorPosition)
                ? cursorPosition
                : (input?.selectionStart ?? queryValue.length)
            const context = getSuggestionContext(queryValue, resolvedCursorPosition)
            suggestionContextRef.current = {
                ...context,
                queryValue
            }

            console.log(`Current segment for suggestions: ${context.currentSegment}`)

            const requestId = ++suggestionRequestIdRef.current

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ field: context.field, value: context.value })
                })

                if (!response.ok) {
                    throw new Error(response.statusText || 'Failed to fetch suggestions.')
                }

                const payload = await response.json()
                if (suggestionRequestIdRef.current !== requestId) return
                const nextSuggestions = Array.isArray(payload.suggestions)
                    ? payload.suggestions
                    : []
                setSuggestions(nextSuggestions)
                console.log('Suggestions:', payload)
            } catch (fetchError) {
                console.error('Fetch error:', fetchError)
                if (suggestionRequestIdRef.current !== requestId) return
                setSuggestions([])
            }
        },
        [getSuggestionContext]
    )

    useEffect(() => {
        if (!showSuggestions || suggestions.length === 0) return

        const frame = requestAnimationFrame(updateSuggestionPosition)
        window.addEventListener('resize', updateSuggestionPosition)
        window.addEventListener('scroll', updateSuggestionPosition, true)

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('resize', updateSuggestionPosition)
            window.removeEventListener('scroll', updateSuggestionPosition, true)
        }
    }, [showSuggestions, suggestions, updateSuggestionPosition])

    useEffect(() => {
        if (suggestions.length === 0) {
            setHighlightedIndex(-1)
            suggestionItemRefs.current = []
            return
        }

        setHighlightedIndex((prev) => (prev >= 0 && prev < suggestions.length ? prev : 0))
    }, [suggestions])

    useEffect(() => {
        if (!showSuggestions || highlightedIndex < 0) return

        const item = suggestionItemRefs.current[highlightedIndex]
        if (item) {
            item.scrollIntoView({ block: 'nearest' })
        }
    }, [highlightedIndex, showSuggestions])

    const handleSuggestionSelect = (suggestion) => {
        let context = suggestionContextRef.current
        if (!context || context.queryValue !== query) {
            const fallbackCursor = inputRef.current?.selectionStart ?? query.length
            context = {
                ...getSuggestionContext(query, fallbackCursor),
                queryValue: query
            }
            suggestionContextRef.current = context
        }

        const isFieldSelection = !context.field
        const normalizedSuggestion = String(suggestion).replace(/\s+/g, '_')
        const replacement = isFieldSelection
            ? `${normalizedSuggestion}:`
            : `${context.field}:${normalizedSuggestion}`
        const nextQuery = `${context.queryValue.slice(0, context.startIndex)}${replacement}${context.queryValue.slice(context.endIndex)}`
        const nextCursor = context.startIndex + replacement.length

        setQuery(nextQuery)
        setShowSuggestions(isFieldSelection)
        if (logsTimeoutRef.current) {
            clearTimeout(logsTimeoutRef.current)
        }
        setPagination((prev) => ({ ...prev, current_page: 1 }))
        fetchLogs({ queryValue: nextQuery, page: 1, perPage: pagination.per_page })
        if (isFieldSelection) {
            fetchSuggestions({ queryValue: nextQuery, cursorPosition: nextCursor })
        } else {
            suggestionRequestIdRef.current += 1
            setSuggestions([])
            setHighlightedIndex(-1)
        }

        requestAnimationFrame(() => {
            inputRef.current?.focus()
            inputRef.current?.setSelectionRange(nextCursor, nextCursor)
        })
    }

    const onChange = (event) => {
        const value = event.target.value
        const cursorPosition = event.target.selectionStart ?? value.length
        setQuery(value)
        if (value.length === 0) {
            suggestionRequestIdRef.current += 1
            setSuggestions([])
            setHighlightedIndex(-1)
            suggestionContextRef.current = null
            setShowSuggestions(true)
            fetchSuggestions({ queryValue: '', cursorPosition: 0 })
        } else {
            setShowSuggestions(true)
            fetchSuggestions({ queryValue: value, cursorPosition })
        }
        if (logsTimeoutRef.current) {
            clearTimeout(logsTimeoutRef.current)
        }
        logsTimeoutRef.current = setTimeout(() => {
            setPagination((prev) => ({ ...prev, current_page: 1 }))
            fetchLogs({ queryValue: value, page: 1, perPage: pagination.per_page })
        }, logsDebounceMs)
    }

    const onKeyDown = (event) => {
        if (!showSuggestions || suggestions.length === 0) return

        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setHighlightedIndex((prev) => (prev + 1) % suggestions.length)
            return
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
            return
        }

        if (event.key === 'Enter') {
            if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                event.preventDefault()
                handleSuggestionSelect(suggestions[highlightedIndex])
            }
            return
        }

        if (event.key === 'Escape') {
            setShowSuggestions(false)
        }
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
            if (logsTimeoutRef.current) {
                clearTimeout(logsTimeoutRef.current)
            }
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current)
            }
        }
    }, [defaultPerPage, fetchLogs])

    return (
        <div className="logs-view-container flex h-full w-full">
            <div className="logs-view-page flex h-full flex-1 flex-col items-center justify-end gap-2 p-8 pt-1.5">
                <h2 className="text-snow flex grow items-center p-4 text-2xl font-bold">
                    AI Logs Analyzer
                </h2>

                <div className="relative w-full" ref={containerRef}>
                    <div
                        className="border-border bg-secondary focus-within:border-accent flex w-full cursor-text items-center gap-2 rounded border px-3 py-2"
                        onClick={
                            // Focus the input when clicking the container
                            () => {
                                inputRef.current?.focus()
                            }
                        }
                    >
                        <Search className="text-metadata h-5 w-5" />
                        <input
                            type="text"
                            ref={inputRef}
                            value={query}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                            onFocus={() => {
                                if (blurTimeoutRef.current) {
                                    clearTimeout(blurTimeoutRef.current)
                                }
                                if (query.length === 0) {
                                    const cursor = inputRef.current?.selectionStart ?? 0
                                    setShowSuggestions(true)
                                    fetchSuggestions({ queryValue: '', cursorPosition: cursor })
                                }
                            }}
                            onBlur={() => {
                                if (blurTimeoutRef.current) {
                                    clearTimeout(blurTimeoutRef.current)
                                }
                                blurTimeoutRef.current = setTimeout(() => {
                                    setShowSuggestions(false)
                                }, 120)
                            }}
                            onClick={() => {
                                requestAnimationFrame(() => {
                                    const cursor = inputRef.current?.selectionStart ?? query.length
                                    setShowSuggestions(true)
                                    fetchSuggestions({ queryValue: query, cursorPosition: cursor })
                                    updateSuggestionPosition()
                                })
                            }}
                            id="queryTextarea"
                            className="text-snow placeholder-metadata flex-1 bg-transparent outline-none"
                            placeholder="Filter by keyword or field"
                        />
                        {query && (
                            <button
                                onClick={() => {
                                    setQuery('')
                                    setPagination((prev) => ({ ...prev, current_page: 1 }))
                                    fetchLogs({
                                        queryValue: '',
                                        page: 1,
                                        perPage: pagination.per_page
                                    })
                                    suggestionRequestIdRef.current += 1
                                    setSuggestions([])
                                    setShowSuggestions(false)
                                    setHighlightedIndex(-1)
                                    suggestionContextRef.current = null
                                }}
                                className="text-metadata hover:text-accent flex h-6 w-6 items-center justify-center rounded transition-colors"
                                title="Clear search"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            ref={dropdownRef}
                            className="border-border bg-secondary absolute z-20 max-h-60 w-64 overflow-auto rounded border shadow-lg"
                            style={{
                                left: `${suggestionPosition.left}px`,
                                top: `${suggestionPosition.top}px`
                            }}
                            data-placement={suggestionPosition.placement}
                        >
                            <ul className="py-1">
                                {suggestions.map((suggestion, index) => (
                                    <li key={`${suggestion}-${index}`}>
                                        <button
                                            type="button"
                                            ref={(node) => {
                                                suggestionItemRefs.current[index] = node
                                            }}
                                            className={`text-snow hover:bg-accent/10 w-full px-3 py-2 text-left ${
                                                index === highlightedIndex ? 'bg-accent/10' : ''
                                            }`}
                                            onMouseDown={(event) => {
                                                event.preventDefault()
                                            }}
                                            onMouseEnter={() => {
                                                setHighlightedIndex(index)
                                            }}
                                            onClick={() => {
                                                handleSuggestionSelect(suggestion)
                                            }}
                                        >
                                            {String(suggestion)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
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
