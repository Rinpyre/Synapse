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

    // TODO: Return the logs in a structured format for the agent to easily consume, including pagination info if needed. The reason being to avoid filling the context window with json duplicated metadata like "total", "per_page", etc. that the agent doesn't need to see.
    /* //? This will return logs in the format of CSV. First row with the columns then the logs:
     * LogID|Teacher/Staff|Subjects/Tags|Category|Time|Message|Level
     * 35513|Niklas SpeedAdmin ApS|Niklas SpeedAdmin ApS|LoginSystem|2026-01-27 13:45:39|Niklas... logged in (10.200.36.50)|2
     * 35517|Niklas SpeedAdmin ApS|Dominik Szoboszlai, Bobby Olsen|StudentProfilePage|2026-01-27 12:47:05|Student shown|2
     */
    const data = await response.json()
    return data
}
