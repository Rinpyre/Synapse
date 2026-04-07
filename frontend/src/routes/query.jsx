import { DataTable } from '@components/features'
import React from 'react'
import TestData from '@assets/dummyData.json'
import { Send } from 'lucide-react'

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
            <div className="flex w-full flex-row items-start gap-2 relative">
                <textarea
                    ref={textareaRef}
                    value={textval}
                    onChange={onChange}
                    className="w-full rounded bg-secondary p-2 text-snow resize-none"
                    placeholder="Enter your query here..."
                />
                <a href="#" className="flex items-center p-0.5 gap-2 text-snow hover:text-blue-500 absolute right-1.25 bottom-1.25">
                <Send className="w-5 h-5" /></a>
            </div>
            <DataTable rows = {multiplyRows(TestData.rows, 100)} columns = {TestData.columns} limit = {15} />
        </div>
    )
}