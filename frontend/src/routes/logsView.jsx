import { DataTable } from '@components/features'
import TestData from '@assets/dummyData.json'
import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const MIN_TEXTAREA_HEIGHT = 16

const multiplyRows = (rows, multiplier) => {
    const multiplied = []
    for (let i = 0; i < multiplier; i++) {
        multiplied.push(...rows.map((row) => ({ ...row, id: row.id + i * rows.length })))
    }
    return multiplied
}

export const LogsViewPage = () => {
    const textareaRef = useRef(null)
    const [textval, setTextval] = useState('')
    const onChange = (event) => setTextval(event.target.value)
    const [_data, setData] = useState({ rows: [], columns: [] })
    const [_searchParams, setSearchParams] = useSearchParams()

    const searchQuery = async (query) => {
        let url = 'http://localhost:8000/api/query?filters=' + encodeURIComponent(query)
        // updating the url with the query so that it can be shared with react
        setSearchParams({ filters: query }, { replace: true })

        try {
            const response = await fetch(url)
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`)
                return
            }
            const data = await response.json()
            setData({ rows: data.rows, columns: data.columns })
        } catch (error) {
            console.error('Fetch error:', error)
        }
    }

    useEffect(() => {
        const queryTextarea = textareaRef.current
        if (!queryTextarea) return
        let timeoutId
        queryTextarea.addEventListener('input', (event) => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            timeoutId = setTimeout(() => {
                searchQuery(event.target.value)
            }, 500)
        })
        return () => {
            queryTextarea.removeEventListener('input', searchQuery)
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }
    })

    useLayoutEffect(() => {
        // Reset height - important to shrink on delete
        textareaRef.current.style.height = '32px'
        // Set height
        textareaRef.current.style.height = `${Math.max(
            textareaRef.current.scrollHeight,
            MIN_TEXTAREA_HEIGHT
        )}px`
    }, [textval])

    return (
        <div className="logs-view-page flex h-full w-full flex-col items-center gap-2 p-8 pt-1.5">
            <h2 className="text-snow text-2xl font-bold">Query</h2>
            <div className="relative flex w-full flex-row items-start gap-2">
                <form method="get" className="relative flex grow flex-col items-end gap-2">
                    <textarea
                        ref={textareaRef}
                        value={textval}
                        onChange={onChange}
                        id="queryTextarea"
                        className="bg-secondary text-snow w-full resize-none rounded p-2"
                        placeholder="Enter your query here..."
                    />
                </form>
            </div>
            <DataTable
                rows={multiplyRows(TestData.rows, 100)}
                columns={TestData.columns}
                limit={15}
            />
        </div>
    )
}
