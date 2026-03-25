export default function LogTable({ rows, columns }) {
    return (
         <div className="flex w-full grow justify-center overflow-hidden">
            <div className="content-view bg-secondary flex w-7xl h-180 rounded-4xl" >
                <table className="table table-bordered table-striped w-full text-center text-snow">
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