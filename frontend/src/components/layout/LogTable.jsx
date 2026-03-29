export default function LogTable({ rows, columns }) {
    return (
        <div className="flex w-full grow justify-center overflow-hidden">
            <div className="content-view bg-secondary flex h-180 w-7xl rounded-4xl">
                <table className="table-bordered table-striped text-snow table w-full text-center">
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th key={index}>{Object.keys(column)[0]}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rindex) => (
                            <tr key={rindex}>
                                {Object.values(row).map((value, cindex) => (
                                    <td key={cindex}>{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
