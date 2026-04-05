import { DataTable } from '@components/features'
import React from 'react'
import TestData from '@assets/dummyData.json'

const MIN_TEXTAREA_HEIGHT = 16;

const multiplyRows = (rows, multiplier) => {
    const multiplied = []
    for (let i = 0; i < multiplier; i++) {
        multiplied.push(...rows.map((row) => ({ ...row, id: row.id + i * rows.length })))
    }
    return multiplied
}

export const QueryPage = () => {
    const textareaRef = React.useRef(null);
    const [textval, setTextval] = React.useState("");
    const onChange = (event) => setTextval(event.target.value);

    React.useLayoutEffect(() => {
    // Reset height - important to shrink on delete
    textareaRef.current.style.height = "32px";
    // Set height
    textareaRef.current.style.height = `${Math.max(
      textareaRef.current.scrollHeight,
      MIN_TEXTAREA_HEIGHT
    )}px`;
    }, [textval]);


    return (
        <div className="logs-view-page flex w-full h-full flex-col items-center gap-2 p-8 pt-1.5">
            <h2 className="text-snow text-2xl font-bold">Query</h2>
            <textarea
                ref={textareaRef}
                value={textval}
                onChange={onChange}
                className="w-full rounded bg-secondary p-2 text-snow resize-none"
                placeholder="Enter your query here..."
            />
            <DataTable rows = {multiplyRows(TestData.rows, 100)} columns = {TestData.columns} limit = {15} />
        </div>
    )
}