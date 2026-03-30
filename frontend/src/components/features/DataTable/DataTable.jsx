import { cn } from '@utils'
import { useState } from 'react'
import { ArrowUpDown, SortAsc, SortDesc } from 'lucide-react'

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

export const DataTable = ({ rows, columns }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

    const handleSort = (columnKey) => {
        const currentDirection = sortConfig.key === columnKey ? sortConfig.direction : null
        const nextDirection =
            sortOptions[(sortOptions.indexOf(currentDirection) + 1) % sortOptions.length]
        setSortConfig({ key: columnKey, direction: nextDirection })
    }

    const sortedRows = sortData(rows, sortConfig.key, sortConfig.direction)

    return (
        <div className="content-view bg-tertiary w-full rounded-lg p-4 shadow-md">
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="border-snow/20 border-b">
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
                    {sortedRows.map((row, rindex) => (
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
        </div>
    )
}
