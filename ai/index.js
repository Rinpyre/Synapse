import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { convertToModelMessages, stepCountIs, streamText, tool } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { queryLogs } from './queryLogs.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

loadEnvironment(__dirname)

const promptPath = path.join(__dirname, 'system-prompt.md')
const cachedPrompt = fs.readFileSync(promptPath, 'utf-8')
const devMode = process.env.NODE_ENV !== 'production'
const model = createModel()
const app = express()
app.use(cors())
app.use(express.json())
const { tools, toolMetadata } = createTools()
const stopWhen = stepCountIs(5)
const logAiRequests = devMode || process.env.AI_LOG_LEVEL === 'debug'

if (!devMode) {
    console.log('AI Service running in production mode.')
    console.log('System prompt loaded and cached in memory.')
} else {
    console.log('AI Service running in development mode.')
    console.log('System prompt will be read from disk on each request for live editing.')
}

// In production, read the system prompt once and cache it in memory.
// In development, read from disk on each request to allow for live editing.
export const getSystemPrompt = () => {
    if (devMode) {
        console.log('Reading system prompt from disk...')
        return fs.readFileSync(promptPath, 'utf-8')
    }
    return cachedPrompt
}
const sanitizeMessages = (messages) => messages.filter((message) => message?.role !== 'system')

app.post('/api/chat', async (req, res) => {
    const requestId = randomUUID()
    res.setHeader('x-request-id', requestId)
    console.log(
        `Received chat request for model: [${model.provider}/${model.modelId}] with ${req.body.messages?.length || 0} messages.`
    )

    // Get the messages array sent from the React frontend
    const { messages, system } = req.body
    const rawMessages = Array.isArray(messages) ? messages : []
    const hasSystemMessage = rawMessages.some((message) => message?.role === 'system')
    if (hasSystemMessage) {
        res.status(400).json({ error: 'System messages are not allowed.' })
        return
    }
    const safeMessages = sanitizeMessages(rawMessages)
    const systemOverride = typeof system === 'string' && system.trim() ? system.trim() : null
    const finalSystem = systemOverride || getSystemPrompt()
    const contextWindow = logAiRequests ? await resolveModelContextWindow() : null
    const requestLogger = logAiRequests
        ? createRequestLogger({
              requestId,
              route: '/api/chat',
              model,
              system: finalSystem,
              messages: safeMessages,
              toolMetadata,
              contextWindow
          })
        : null

    // Pass it to Vercel's streamText function, pointing it to the configured provider.
    const result = streamText({
        //? Model name/id as defined by the active provider.
        model,
        tools,
        messages: await convertToModelMessages(safeMessages),
        system: finalSystem,
        allowSystemInMessages: false,
        stopWhen,
        onStepFinish: requestLogger?.onStepFinish,
        onFinish: requestLogger?.onFinish
    })

    // Vercel pipes the streaming response directly back to React
    result.pipeUIMessageStreamToResponse(res)
})

app.post('/api/chat/dev', async (req, res) => {
    const requestId = randomUUID()
    res.setHeader('x-request-id', requestId)
    console.log(
        `Received DEV chat request for model: [${model.provider}/${model.modelId}] with ${req.body.messages?.length || 0} messages.`
    )

    const { messages, prompt, system } = req.body

    const uiMessages = Array.isArray(messages)
        ? messages.map((message, index) => ({
              id: message.id ?? `dev-${index}`,
              role: message.role ?? 'user',
              parts: [{ type: 'text', text: message.content ?? '' }]
          }))
        : prompt
          ? [{ id: 'prompt-0', role: 'user', parts: [{ type: 'text', text: prompt }] }]
          : []

    const hasSystemMessage = uiMessages.some((message) => message?.role === 'system')
    if (hasSystemMessage) {
        res.status(400).json({ error: 'System messages are not allowed.' })
        return
    }

    const safeUiMessages = sanitizeMessages(uiMessages)

    if (safeUiMessages.length === 0) {
        res.status(400).json({ error: 'Provide messages[] or prompt.' })
        return
    }

    const systemOverride = typeof system === 'string' && system.trim() ? system.trim() : null
    const finalSystem = systemOverride || getSystemPrompt()
    const contextWindow = logAiRequests ? await resolveModelContextWindow() : null
    const requestLogger = logAiRequests
        ? createRequestLogger({
              requestId,
              route: '/api/chat/dev',
              model,
              system: finalSystem,
              messages: safeUiMessages,
              toolMetadata,
              contextWindow
          })
        : null

    const result = streamText({
        model,
        tools,
        messages: await convertToModelMessages(safeUiMessages),
        system: finalSystem,
        allowSystemInMessages: false,
        stopWhen,
        onStepFinish: requestLogger?.onStepFinish,
        onFinish: requestLogger?.onFinish
    })

    result.pipeTextStreamToResponse(res)
})

app.listen(8001)

function loadEnvironment(baseDir) {
    const envFiles = listEnvFiles(baseDir)
    if (envFiles.length === 0) {
        console.warn('No .env file found in the ai folder. Using existing environment variables.')
        return null
    }

    const selected = selectEnvFile(envFiles)
    dotenv.config({ path: selected })
    console.log(`Loaded environment from ${path.basename(selected)}`)
    return selected
}

function listEnvFiles(baseDir) {
    return fs
        .readdirSync(baseDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.startsWith('.env'))
        .map((entry) => path.join(baseDir, entry.name))
}

function selectEnvFile(envFiles) {
    if (envFiles.length === 1) {
        return envFiles[0]
    }

    const envName = process.env.NODE_ENV?.trim()
    const precedence = []

    if (envName) {
        precedence.push(`.env.${envName}.local`, `.env.${envName}`)
    }

    precedence.push('.env.local', '.env')

    const envMap = new Map(envFiles.map((filePath) => [path.basename(filePath), filePath]))
    for (const candidate of precedence) {
        const match = envMap.get(candidate)
        if (match) {
            return match
        }
    }

    const sorted = [...envFiles].sort((left, right) =>
        path.basename(left).localeCompare(path.basename(right))
    )

    return sorted[0]
}

function createModelFromEnv() {
    const providerName = normalizeProviderName(requireEnv('PROVIDER'))
    const baseUrl = requireEnv('BASE_URL')
    const modelId = requireEnv('MODEL')

    if (providerName === 'ollama') {
        const provider = createOllama({ baseURL: baseUrl })
        return provider(modelId)
    }

    if (providerName === 'lmstudio') {
        const apiKey = requireEnv('LMSTUDIO_API_KEY')
        const provider = createOpenAICompatible({
            name: 'lmstudio',
            baseURL: baseUrl,
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        })
        return provider(modelId)
    }

    throw new Error(`Unsupported PROVIDER: ${providerName}`)
}

function createModel() {
    try {
        return createModelFromEnv()
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`AI configuration error: ${message}`)
        process.exit(1)
    }
}

function normalizeProviderName(value) {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'ollama') {
        return 'ollama'
    }
    if (normalized === 'lmstudio' || normalized === 'lm-studio') {
        return 'lmstudio'
    }
    throw new Error(`Unsupported PROVIDER: ${value}`)
}

function requireEnv(name) {
    const rawValue = process.env[name]
    const value = typeof rawValue === 'string' ? rawValue.trim() : ''
    if (!value) {
        throw new Error(`Missing required env var: ${name}`)
    }
    return value
}

const directFilterTags = new Set(['id', 'level', 'category'])
const relationalFilterTags = new Set([
    'student',
    'school',
    'teacher',
    'booking',
    'room',
    'equipment',
    'parent'
])
const wildcardAllowedTags = new Set([...directFilterTags, ...relationalFilterTags])

function normalizeFilterValue(tag, value) {
    if (value === null || value === undefined) {
        return null
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
        return null
    }

    const trimmed = String(value).trim()
    if (!trimmed) {
        return null
    }

    if (!wildcardAllowedTags.has(tag) && trimmed.includes('*')) {
        throw new Error(`Wildcards are not supported for "${tag}" filters.`)
    }

    return trimmed.replace(/\s+/g, '_')
}

function buildFiltersString(filters, freeText) {
    const parts = []

    for (const [tag, value] of Object.entries(filters)) {
        const normalized = normalizeFilterValue(tag, value)
        if (!normalized) {
            continue
        }

        parts.push(`${tag}:${normalized}`)
    }

    if (typeof freeText === 'string' && freeText.trim()) {
        const sanitized = freeText.replace(/:/g, ' ').trim()
        const terms = sanitized.split(/\s+/).filter(Boolean)
        parts.push(...terms)
    }

    return parts.join(' ')
}

function createTools() {
    const queryLogsDescription = 'Query logs from the backend with filters and pagination.'
    const queryLogsSchema = z.object({
        id: z.string().optional().describe('Log ID (supports * wildcard).'),
        level: z
            .string()
            .optional()
            .describe('Log level (1-5, not error/info/warn) (supports * wildcard).'),
        category: z
            .string()
            .optional()
            .describe('Category text (supports * wildcard, spaces become underscores).'),
        time: z.string().optional().describe('Time filter (HH:MM or HH:MM:SS, no wildcards).'),
        date: z.string().optional().describe('Date filter (YYYY-MM-DD, no wildcards).'),
        type: z.coerce
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe(
                'Entity type ID Entity type ID (refer to the Log Types Map in your system instructions) (no wildcards).'
            ),
        entity: z.coerce
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe('Entity ID (no wildcards).'),
        student: z
            .string()
            .optional()
            .describe('Student name (supports * wildcard, spaces become underscores).'),
        school: z
            .string()
            .optional()
            .describe('School name (supports * wildcard, spaces become underscores).'),
        teacher: z
            .string()
            .optional()
            .describe('Teacher name (supports * wildcard, spaces become underscores).'),
        booking: z
            .string()
            .optional()
            .describe('Booking title (supports * wildcard, spaces become underscores).'),
        room: z
            .string()
            .optional()
            .describe('Room name (supports * wildcard, spaces become underscores).'),
        equipment: z
            .string()
            .optional()
            .describe('Equipment name (supports * wildcard, spaces become underscores).'),
        parent: z
            .string()
            .optional()
            .describe('Parent name (supports * wildcard, spaces become underscores).'),
        freeText: z.string().optional().describe('Free-text search terms (no colons).'),
        page: z
            .number()
            .int()
            .positive()
            .default(1)
            .describe('Page number for pagination (default: 1).'),
        perPage: z
            .number()
            .int()
            .positive()
            .max(100)
            .default(20)
            .describe('Number of logs per page (default: 20, max: 100).')
    })

    return {
        tools: {
            queryLogs: tool({
                name: 'queryLogs',
                description: queryLogsDescription,
                inputSchema: queryLogsSchema,
                execute: async ({ page, perPage, freeText, ...filters }) => {
                    try {
                        const filtersString = buildFiltersString(filters, freeText)
                        const data = await queryLogs(filtersString, page, perPage)
                        return { success: true, data }
                    } catch (error) {
                        const message = error instanceof Error ? error.message : String(error)
                        return { success: false, error: message }
                    }
                }
            })
        },
        toolMetadata: {
            queryLogs: {
                description: queryLogsDescription,
                inputKeys: Object.keys(queryLogsSchema.shape)
            }
        }
    }
}

let modelContextWindowPromise = null

function createRequestLogger({
    requestId,
    route,
    model,
    system,
    messages,
    toolMetadata,
    contextWindow
}) {
    const systemChars = typeof system === 'string' ? system.length : 0
    const messageTextChars = messages.reduce(
        (total, message) => total + getMessageTextForLog(message).length,
        0
    )
    const toolSummary = Object.entries(toolMetadata ?? {}).map(([name, meta]) => ({
        name,
        descriptionChars: meta.description?.length ?? 0,
        inputKeys: meta.inputKeys ?? []
    }))
    const toolDescriptionChars = toolSummary.reduce(
        (total, toolEntry) => total + toolEntry.descriptionChars,
        0
    )
    const estimatedPromptTokens = estimateTokenCount(
        systemChars + messageTextChars + toolDescriptionChars
    )
    const log = {
        requestId,
        route,
        startedAt: new Date().toISOString(),
        model: {
            provider: model.provider,
            id: model.modelId
        },
        contextWindow: {
            tokens: contextWindow?.tokens ?? null,
            source: contextWindow?.source ?? 'unknown'
        },
        system: {
            chars: systemChars
        },
        messages: {
            count: messages.length,
            textChars: messageTextChars
        },
        tools: toolSummary,
        estimates: {
            promptTokens: estimatedPromptTokens
        },
        steps: []
    }

    return {
        onStepFinish: (step) => recordStep(log, step),
        onFinish: (summary) => finalizeRequestLog(log, summary)
    }
}

function recordStep(log, { toolCalls, toolResults, finishReason, usage }) {
    log.steps.push({
        index: log.steps.length + 1,
        finishReason,
        usage: usage ?? null,
        toolCalls: serializeToolCalls(toolCalls),
        toolResults: serializeToolResults(toolResults)
    })
}

function finalizeRequestLog(log, { text, finishReason, usage, toolCalls, toolResults }) {
    log.finishedAt = new Date().toISOString()
    log.finish = {
        finishReason,
        usage: usage ?? null,
        responseChars: typeof text === 'string' ? text.length : 0
    }
    if (toolCalls?.length || toolResults?.length) {
        log.finish.toolCalls = serializeToolCalls(toolCalls)
        log.finish.toolResults = serializeToolResults(toolResults)
    }

    console.log(`[AI][${log.requestId}] Request summary:\n${JSON.stringify(log, null, 2)}`)
}

function serializeToolCalls(toolCalls) {
    if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
        return []
    }

    return toolCalls.map((call) => ({
        toolName: call?.toolName ?? call?.name ?? null,
        toolCallId: call?.toolCallId ?? call?.id ?? null,
        args:
            call?.input ??
            call?.args ??
            call?.arguments ??
            call?.parameters ??
            call?.params ??
            call?.function?.arguments ??
            null
    }))
}

function serializeToolResults(toolResults) {
    if (!Array.isArray(toolResults) || toolResults.length === 0) {
        return []
    }

    return toolResults.map((result) => ({
        toolName: result?.toolName ?? result?.name ?? null,
        toolCallId: result?.toolCallId ?? result?.id ?? null,
        input: result?.input ?? null,
        output: result?.output ?? result?.result ?? null
    }))
}

function getMessageTextForLog(message) {
    if (!message) {
        return ''
    }

    if (typeof message.content === 'string') {
        return message.content
    }

    const parts = Array.isArray(message.parts) ? message.parts : []
    return parts.map((part) => (part?.type === 'text' ? (part.text ?? '') : '')).join('')
}

function estimateTokenCount(charCount) {
    if (!Number.isFinite(charCount) || charCount <= 0) {
        return 0
    }

    return Math.ceil(charCount / 4)
}

async function resolveModelContextWindow() {
    if (modelContextWindowPromise) {
        return modelContextWindowPromise
    }

    modelContextWindowPromise = fetchModelContextWindow().catch((error) => {
        const message = error instanceof Error ? error.message : String(error)
        console.warn(`Failed to resolve model context window: ${message}`)
        return null
    })

    return modelContextWindowPromise
}

async function fetchModelContextWindow() {
    const providerName = normalizeProviderName(requireEnv('PROVIDER'))
    const baseUrl = requireEnv('BASE_URL')
    const modelId = requireEnv('MODEL')

    if (providerName === 'ollama') {
        const tokens = await fetchOllamaContextWindow(baseUrl, modelId)
        return {
            tokens,
            source: 'ollama'
        }
    }

    return {
        tokens: null,
        source: providerName
    }
}

async function fetchOllamaContextWindow(baseUrl, modelId) {
    const url = buildProviderUrl(baseUrl, 'show')
    if (!url) {
        return null
    }

    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: modelId })
    })

    if (!response.ok) {
        return null
    }

    const payload = await response.json()
    const parameters = typeof payload?.parameters === 'string' ? payload.parameters : ''
    const parsedParams = parseOllamaParameters(parameters)
    const numCtx = Number(parsedParams.num_ctx)
    if (Number.isFinite(numCtx)) {
        return numCtx
    }

    return getContextFromModelInfo(payload?.model_info)
}

function buildProviderUrl(baseUrl, pathSegment) {
    try {
        const url = new URL(baseUrl)
        const basePath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname
        const nextPath = pathSegment.startsWith('/') ? pathSegment.slice(1) : pathSegment
        url.pathname = `${basePath}/${nextPath}`
        return url
    } catch {
        return null
    }
}

function parseOllamaParameters(parametersText) {
    if (typeof parametersText !== 'string') {
        return {}
    }

    return parametersText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .reduce((acc, line) => {
            const [key, value] = line.split(/\s+/)
            if (key && value) {
                acc[key] = value
            }
            return acc
        }, {})
}

function getContextFromModelInfo(modelInfo) {
    if (!modelInfo || typeof modelInfo !== 'object') {
        return null
    }

    const keys = ['llama.context_length', 'context_length', 'num_ctx']
    for (const key of keys) {
        const value = Number(modelInfo[key])
        if (Number.isFinite(value)) {
            return value
        }
    }

    return null
}
