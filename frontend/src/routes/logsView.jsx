import { useEffect, useState } from 'react'
import { DataTable } from '@components/features'

export const LogsViewPage = () => {
    const [data, setData] = useState({ rows: [], columns: [] })

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('http://localhost:8000/api/logs')
            const data = await response.json()
            setData({ rows: data.rows, columns: data.columns })
        }
        fetchData()
    }, [])

    return (
        <div className="logs-view-page flex h-full w-full flex-col items-center gap-2 p-8 pt-1.5">
            <h2 className="text-snow text-2xl font-bold">Logs View</h2>
            <DataTable rows={data.rows} columns={data.columns} />
        </div>
    )
}
