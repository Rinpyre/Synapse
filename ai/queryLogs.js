// This funtion retrieves logs based on the provided filters and pagination parameters
// The filters are tag based and can be used to narrow down the logs to specific criteria
// Example of "filters" parameter: "teacher:Albæk level:4"

// The fetch should do a GET to the API base URL with the endpoint "/api/logs" and the query parameters "filters", "page", and "per_page" (for page size, max 100)
export async function queryLogs(filters, page = 1, perPage = 20) {
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

    const data = await response.json()
    return data
}
