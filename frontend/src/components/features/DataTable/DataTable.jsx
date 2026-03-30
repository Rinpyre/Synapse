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

export const DataTable = ({ rows, columns, limit = 20, loading, error }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(limit)

    const handleSort = (columnKey) => {
        const currentDirection = sortConfig.key === columnKey ? sortConfig.direction : null
        const nextDirection =
            sortOptions[(sortOptions.indexOf(currentDirection) + 1) % sortOptions.length]
        setSortConfig({ key: columnKey, direction: nextDirection })
    }

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value))
    }

    const sortedRows = sortData(rows, sortConfig.key, sortConfig.direction)

    // Calculate pagination values
    const totalPages = Math.ceil(sortedRows.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedRows = sortedRows.slice(startIndex, endIndex)

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
            if (currentPage > 3) {
                pages.push('...')
            }

            // Show pages around current
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i)
                }
            }

            // Add ellipsis if gap after current range
            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            // Always show last page
            pages.push(totalPages)
        }
        return pages
    }

    return (
        <div className="content-view bg-tertiary w-full rounded-lg p-2">
            <div className="loading">
                {loading ? (
                    <div className="bg-tertiary/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <span className="text-snow/80 text-sm">Loading...</span>
                    </div>
                ) : error ? (
                    <div className="bg-tertiary/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <span className="text-error text-sm">{error}</span>
                    </div>
                ) : null}
            </div>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="border-snow/20 bg-tertiary/80 sticky top-0 z-1 border-b backdrop-blur-sm">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="text-snow group/header border-snow/20 border-r p-2 text-left text-sm font-medium tracking-wider uppercase last:border-r-0"
                            >
                                <div
                                    className="flex items-center"
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
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-snow/80">
                    {paginatedRows.map((row, rindex) => (
                        <tr
                            key={rindex}
                            className={cn(
                                'border-snow/20 hover:bg-snow/10 border-b',
                                rindex % 2 === 0 && 'bg-snow/5'
                            )}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    className="border-snow/20 border-r p-2 text-sm last:border-r-0"
                                >
                                    {row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-2 flex items-center justify-between gap-4 px-2">
                {/* Left side: Items per page selector */}
                <div className="flex items-center gap-3">
                    <label htmlFor="itemsPerPage" className="text-snow/70 text-sm">
                        Show:
                    </label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
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
                                currentPage <= 10
                                    ? 'invisible cursor-not-allowed opacity-50'
                                    : 'hover:text-snow/50 active:text-snow/20 cursor-pointer'
                            )}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 10))}
                            disabled={currentPage <= 10}
                            title="Back 10 pages"
                        >
                            <JumpBack10 size={16} />
                        </button>
                    )}

                    {/* Previous button */}
                    <button
                        className={cn(
                            'flex items-center transition-all duration-200',

                            currentPage === 1
                                ? 'invisible cursor-not-allowed opacity-50'
                                : 'hover:text-snow/50 active:text-snow/20 cursor-pointer'
                        )}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        title="Previous page"
                    >
                        <PrevPage size={16} />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, idx) =>
                            page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="text-snow/50 px-2 py-2">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    className={cn(
                                        'flex h-6 min-w-6 items-center justify-center rounded-md p-1 text-sm font-medium transition-all duration-200',
                                        currentPage === page
                                            ? 'bg-secondary/70 text-snow'
                                            : 'text-snow/70 hover:bg-snow/10 cursor-pointer'
                                    )}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            )
                        )}
                    </div>

                    {/* Next button */}
                    <button
                        className={cn(
                            'flex items-center transition-all duration-200',
                            currentPage === totalPages
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:text-snow/50 active:text-snow/20 cursor-pointer'
                        )}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        title="Next page"
                    >
                        <NextPage size={16} />
                    </button>

                    {/* Jump forward 10 button (if many pages) */}
                    {totalPages > 20 && (
                        <button
                            className={cn(
                                'text-snow/70 transition-all duration-200',
                                currentPage > totalPages - 10
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:text-snow/50 active:text-snow/20 cursor-pointer'
                            )}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 10))}
                            disabled={currentPage > totalPages - 10}
                            title="Forward 10 pages"
                        >
                            <JumpForward10 size={16} />
                        </button>
                    )}

                    {/* Total info */}
                    <span className="text-snow/60 ml-2 text-sm">
                        {sortedRows.length > 0 ? startIndex + 1 : 0}-
                        {Math.min(endIndex, sortedRows.length)} of{' '}
                        <span className="text-snow font-semibold">{sortedRows.length}</span>
                    </span>
                </div>
            </div>
        </div>
    )
}
