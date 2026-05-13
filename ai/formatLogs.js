export function formatLogs(logs) {
    if (!logs.rows || logs.rows.length === 0) {
        return 'No logs found for the given filters.'
    }

    const header = logs.columns.map((col) => col.label).join('|')
    const formattedLogs = logs.rows.map((log) => {
        const logId = log.logId || ''
        const teacherStaff = log.entityName || ''
        const subjectsTags = log.subjects || ''
        const category = log.category || ''
        const time = log.time || ''
        const message = log.message || ''
        const level = log.level || ''

        return `${logId}|${teacherStaff}|${subjectsTags}|${category}|${time}|${message}|${level}`
    })

    const paginationInfo = `Total Logs: ${logs.pagination.total}\nReturned Logs: ${logs.rows.length}\nPage: ${logs.pagination.current_page} / ${logs.pagination.last_page}`
    const responseText = `${header}\n${formattedLogs.join('\n')}\n\n${paginationInfo}`
    return responseText
}
