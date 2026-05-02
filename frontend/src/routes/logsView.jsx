import { useEffect, useState } from 'react'
import { DataTable } from '@components/features'

export const LogsViewPage = () => {
    const [data, setData] = useState({ rows: [], columns: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const response = await fetch('http://localhost:8000/api/logs')
                if (!response.ok) {
                    setError(`HTTP error! status: ${response.status}`)
                    setLoading(false)
                    return
                }
                const data = await response.json()
                setData({ rows: data.rows, columns: data.columns })
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="logs-view-page flex h-full w-full flex-col items-center gap-2 p-8 pt-1.5">
            <h2 className="text-snow text-2xl font-bold">Logs View</h2>
            <DataTable rows={data.rows} columns={data.columns} loading={loading} error={error} />
        </div>
    )
}
