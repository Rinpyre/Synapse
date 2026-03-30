import { DataTable } from '@components/features'
import rows from '@assets/tmp/rows.json'
import columns from '@assets/tmp/columns.json'

//? [TEMP] Multiply the rows to simulate a larger dataset (you can adjust the multiplier as needed)
const multiplyRows = (rows, multiplier) => {
    const multiplied = []
    for (let i = 0; i < multiplier; i++) {
        multiplied.push(...rows.map((row) => ({ ...row, id: row.id + i * rows.length })))
    }
    return multiplied
}

export const LogsViewPage = () => {
    return (
        <div className="logs-view-page flex h-full w-full flex-col items-center gap-8 p-8">
            <h1 className="text-snow text-2xl font-bold">Logs View</h1>
            <DataTable rows={multiplyRows(rows, 1)} columns={columns} />
        </div>
    )
}
