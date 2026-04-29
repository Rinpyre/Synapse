import { DataTable } from '@components/features'
import TestData from '@assets/dummyData.json'
import TestNames from '@assets/dummyNames.json'
import Types from '@assets/types.json'
import React from 'react'
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
                <select name="type" id="type" className="rounded bg-secondary p-2 text-snow">
                    <option value="Null">Choose a type...</option>
                    {Types.map((type, index) => (
                        <option key={index} value={type.EntityId}>
                            {type.Value}
                        </option>
                    ))}
                </select>
                <select className="rounded bg-secondary p-2 text-snow max-h-32">
                    <option value="Null">Choose a name...</option>
                    {TestNames.map((name, index) => (
                        <option key={index} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
                <textarea
                    ref={textareaRef}
                    value={textval}
                    onChange={onChange}
                    className="w-full rounded bg-secondary p-2 text-snow resize-none"
                    placeholder="Enter your query here..."
                />
                <a href="#" className="flex text-snow hover:bg-snow/20 p-1 rounded items-center absolute right-1.25 bottom-1.25">
                <Send className="w-5 h-5" /></a>
            </div>
            <DataTable rows = {multiplyRows(TestData.rows, 100)} columns = {TestData.columns} limit = {15} />
        </div>
    )
}