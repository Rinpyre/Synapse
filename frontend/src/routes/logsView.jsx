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
        <div className="logs-view-page flex h-full w-full flex-col items-center gap-2 p-8 pt-1.5">
            <h2 className="text-snow text-2xl font-bold">Logs View</h2>
            <DataTable rows={multiplyRows(rows, 100)} columns={columns} />
        </div>
    )
}
