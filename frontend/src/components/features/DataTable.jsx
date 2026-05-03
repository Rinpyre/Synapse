import { cn } from '@utils'
import { useState } from 'react'
import {
    ArrowUpDown,
    SortAsc,
    SortDesc,
    ChevronLeft as PrevPage,
    ChevronRight as NextPage,
    ChevronsLeft as JumpBack10,
    ChevronsRight as JumpForward10
} from 'lucide-react'

const sortOptions = ['asc', 'desc', null]

const sortData = (data, columnKey, direction) => {
    if (!direction) return data
    const sortedData = [...data].sort((a, b) => {
        if (a[columnKey] < b[columnKey]) return direction === 'asc' ? -1 : 1
        if (a[columnKey] > b[columnKey]) return direction === 'asc' ? 1 : -1
        return 0
    })
    return sortedData
}

const normalizeSize = (value) => {
    if (value === undefined || value === null || value === '') return null
    return typeof value === 'number' ? `${value}px` : value
}

const getColumnSizing = (column) => {
    const labelLength = column?.label?.length ?? 0
    const minChars = Math.max(labelLength, 8)
    const defaultMinWidth = `${minChars}ch`
    const defaultMaxWidth = `${Math.max(minChars * 2, 28)}ch`

    return {
        minWidth: normalizeSize(column?.minWidth) ?? defaultMinWidth,
        maxWidth: normalizeSize(column?.maxWidth) ?? defaultMaxWidth
    }
}

export const DataTable = ({
    rows = [],
    columns = [],
    limit = 20,
    loading = false,
    error = '',
    bodyMaxHeight = '70vh',
    pagination = null,
    onPageChange,
    onPerPageChange,
    onSortChange
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
    const [clientPage, setClientPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(limit)

    const handleSort = (columnKey) => {
        const currentDirection = sortConfig.key === columnKey ? sortConfig.direction : null
        const nextDirection =
            sortOptions[(sortOptions.indexOf(currentDirection) + 1) % sortOptions.length]
        const nextSort = { key: columnKey, direction: nextDirection }
        setSortConfig(nextSort)
        if (onSortChange) {
            onSortChange(nextSort)
        }
    }

    const isServerPaginated = Boolean(pagination)
    const serverPage = pagination?.current_page ?? 1
    const serverPerPage = pagination?.per_page ?? itemsPerPage
    const serverTotal = pagination?.total ?? rows.length
    const serverLastPage = pagination?.last_page

    const page = Math.min(
        Math.max(isServerPaginated ? serverPage : clientPage, 1),
        Math.max(1, serverLastPage ?? Math.ceil(serverTotal / serverPerPage))
    )
    const perPage = isServerPaginated ? serverPerPage : itemsPerPage

    const handleItemsPerPageChange = (e) => {
        const nextPerPage = Number.parseInt(e.target.value, 10)
        if (isServerPaginated) {
            if (onPerPageChange) {
                onPerPageChange(nextPerPage)
                return
            }
            if (onPageChange) {
                onPageChange(1)
            }
            return
        }

        setItemsPerPage(nextPerPage)
        setClientPage(1)
    }

    const shouldSortLocally = !onSortChange
    const sortedRows = shouldSortLocally
        ? sortData(rows, sortConfig.key, sortConfig.direction)
        : rows
    const errorMessage =
        error ||
        (rows.length === 0 && columns.length === 0 && !loading
            ? 'No data has been passed to the table component.'
            : '')

    // Calculate pagination values
    const totalItems = isServerPaginated ? serverTotal : sortedRows.length
    const totalPages = Math.max(1, serverLastPage ?? Math.ceil(totalItems / perPage))
    const localStartIndex = (page - 1) * perPage
    const localEndIndex = localStartIndex + perPage
    const paginatedRows = isServerPaginated
        ? sortedRows
        : sortedRows.slice(localStartIndex, localEndIndex)

    const displayStart = isServerPaginated
        ? (pagination?.from ?? 0)
        : sortedRows.length > 0
          ? localStartIndex + 1
          : 0

    const displayEnd = isServerPaginated
        ? (pagination?.to ?? 0)
        : Math.min(localEndIndex, sortedRows.length)

    // Generate page numbers to display intelligently
    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            // Add ellipsis if gap before current range
            if (page > 3) {
                pages.push('...')
            }

            // Show pages around current
            const start = Math.max(2, page - 1)
            const end = Math.min(totalPages - 1, page + 1)
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i)
                }
            }

            // Add ellipsis if gap after current range
            if (page < totalPages - 2) {
                pages.push('...')
            }

            // Always show last page
            pages.push(totalPages)
        }
        return pages
    }

    const resolvedColumns = columns.map((column) => ({
        ...column,
        sizing: getColumnSizing(column)
    }))

    return (
        <div className="content-view bg-secondary border-snow/20 w-full rounded border">
            <div className="loading">
                {errorMessage ? (
                    <div className="bg-tertiary/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <span className="text-error text-sm">{errorMessage}</span>
                    </div>
                ) : null}
            </div>

            <div className="relative overflow-auto" style={{ maxHeight: bodyMaxHeight }}>
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="border-snow/20 bg-tertiary/80 sticky top-0 z-1 border-b backdrop-blur-sm">
                            {resolvedColumns.map((column, index) => (
                                <th
                                    key={column.key || index}
                                    style={column.sizing}
                                    className="text-snow group/header border-snow/20 border-r p-2 text-left text-sm font-medium tracking-wider whitespace-nowrap uppercase last:border-r-0"
                                >
                                    <button
                                        className="flex w-full items-center"
                                        onClick={() => handleSort(column.key)}
                                        title={`Sort by ${column.label}`}
                                    >
                                        {column.label}
                                        <div className="grow"></div>
                                        {sortConfig.key === column.key && sortConfig.direction ? (
                                            sortConfig.direction === 'asc' ? (
                                                <SortAsc
                                                    size={16}
                                                    className="text-snow ml-1 inline-block cursor-pointer"
                                                />
                                            ) : (
                                                <SortDesc
                                                    size={16}
                                                    className="text-snow ml-1 inline-block cursor-pointer"
                                                />
                                            )
                                        ) : (
                                            <ArrowUpDown
                                                size={16}
                                                className="text-snow/50 invisible ml-1 inline-block cursor-pointer group-hover/header:visible"
                                            />
                                        )}
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-snow/80">
                        {paginatedRows.map((row, rindex) => (
                            <tr
                                key={row.logId || row.id || rindex}
                                className={cn(
                                    'border-snow/20 hover:bg-snow/10 border-b',
                                    rindex % 2 === 0 && 'bg-snow/5'
                                )}
                            >
                                {resolvedColumns.map((column, cindex) => (
                                    <td
                                        key={column.key || cindex}
                                        style={column.sizing}
                                        className="border-snow/20 border-r p-2 text-sm last:border-r-0"
                                    >
                                        <div className="scroll-none w-full overflow-x-auto whitespace-nowrap">
                                            {row[column.key]}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div className="bg-tertiary/70 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-snow/80 text-sm">Loading...</span>
                    </div>
                )}
            </div>

            {!errorMessage && (
                <div className="flex items-center justify-between gap-4 p-2">
                    {/* Left side: Items per page selector */}
                    <div className="flex items-center gap-3">
                        <label htmlFor="itemsPerPage" className="text-snow/70 text-sm">
                            Show:
                        </label>
                        <select
                            id="itemsPerPage"
                            value={perPage}
                            onChange={handleItemsPerPageChange}
                            className="border-snow/30 bg-secondary/40 text-snow hover:border-snow/60 rounded-md border p-1 text-sm transition-all outline-none"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>

                    {/* Right side: Pagination controls */}
                    <div className="flex items-center gap-2">
                        {/* Jump back 10 button (if many pages) */}
                        {totalPages > 20 && (
                            <button
                                className={cn(
                                    'text-snow/70 transition-all duration-200',
                                    page <= 10
                                        ? 'invisible cursor-not-allowed opacity-50'
                                        : 'hover:text-snow/50 active:text-snow/20 cursor-pointer'
                                )}
                                onClick={() =>
                                    isServerPaginated
                                        ? onPageChange?.(Math.max(1, page - 10))
                                        : setClientPage((p) => Math.max(1, p - 10))
                                }
                                disabled={page <= 10}
                                title="Back 10 pages"
                            >
                                <JumpBack10 size={16} />
                            </button>
                        )}

                        {/* Previous button */}
                        <button
                            className={cn(
                                'flex items-center transition-all duration-200',

                                page === 1
                                    ? 'invisible cursor-not-allowed opacity-50'
                                    : 'hover:text-snow/50 active:text-snow/20 cursor-pointer'
                            )}
                            onClick={() =>
                                isServerPaginated
                                    ? onPageChange?.(Math.max(1, page - 1))
                                    : setClientPage((p) => Math.max(1, p - 1))
                            }
                            disabled={page === 1}
                            title="Previous page"
                        >
                            <PrevPage size={16} />
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((pageNumber, idx) =>
                                pageNumber === '...' ? (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="text-snow/50 px-2 py-2"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={pageNumber}
                                        className={cn(
                                            'flex h-6 min-w-6 items-center justify-center rounded-md p-1 text-sm font-medium transition-all duration-200',
                                            page === pageNumber
                                                ? 'bg-secondary/70 text-snow'
                                                : 'text-snow/70 hover:bg-snow/10 cursor-pointer'
                                        )}
                                        onClick={() =>
                                            isServerPaginated
                                                ? onPageChange?.(pageNumber)
                                                : setClientPage(pageNumber)
                                        }
                                    >
                                        {pageNumber}
                                    </button>
                                )
                            )}
                        </div>

                        {/* Next button */}
                        <button
                            className={cn(
                                'flex items-center transition-all duration-200',
                                page === totalPages
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:text-snow/50 active:text-snow/20 cursor-pointer'
                            )}
                            onClick={() =>
                                isServerPaginated
                                    ? onPageChange?.(Math.min(totalPages, page + 1))
                                    : setClientPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                            title="Next page"
                        >
                            <NextPage size={16} />
                        </button>

                        {/* Jump forward 10 button (if many pages) */}
                        {totalPages > 20 && (
                            <button
                                className={cn(
                                    'text-snow/70 transition-all duration-200',
                                    page > totalPages - 10
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'hover:text-snow/50 active:text-snow/20 cursor-pointer'
                                )}
                                onClick={() =>
                                    isServerPaginated
                                        ? onPageChange?.(Math.min(totalPages, page + 10))
                                        : setClientPage((p) => Math.min(totalPages, p + 10))
                                }
                                disabled={page > totalPages - 10}
                                title="Forward 10 pages"
                            >
                                <JumpForward10 size={16} />
                            </button>
                        )}

                        {/* Total info */}
                        <span className="text-snow/60 ml-2 text-sm">
                            {displayStart}-{displayEnd} of{' '}
                            <span className="text-snow font-semibold">{totalItems}</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}
