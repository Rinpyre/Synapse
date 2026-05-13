import { formatLogs } from './formatLogs.js'

export async function queryLogs(filters = '', page = 1, perPage = 20) {
    const baseUrl = process.env.BACKEND_URL
    if (!baseUrl) {
        throw new Error('Missing BACKEND_URL environment variable')
    }

    const url = new URL('/api/logs', baseUrl)
    url.searchParams.append('filters', filters)
    url.searchParams.append('page', page.toString())
    url.searchParams.append('per_page', perPage.toString())

    const response = await fetch(url.toString())
    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
            `Failed to fetch logs: ${response.status} ${response.statusText} - ${errorText}`
        )
    }

    const logs = await response.json()
    return formatLogs(logs)
}
