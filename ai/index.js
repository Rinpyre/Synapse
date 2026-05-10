import express from 'express'
import cors from 'cors'
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
const tools = createTools()
const stopWhen = stepCountIs(5)

const logToolActivity = ({ toolCalls, toolResults }) => {
    if (!devMode) {
        return
    }

    if (!toolCalls?.length && !toolResults?.length) {
        return
    }

    console.log('Tool calls:', JSON.stringify(toolCalls))
    console.log('Tool results:', JSON.stringify(toolResults))
}

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

    // Pass it to Vercel's streamText function, pointing it to the configured provider.
    const result = streamText({
        //? Model name/id as defined by the active provider.
        model,
        tools,
        messages: await convertToModelMessages(safeMessages),
        system: finalSystem,
        allowSystemInMessages: false,
        stopWhen,
        onStepFinish: logToolActivity
    })

    // Vercel pipes the streaming response directly back to React
    result.pipeUIMessageStreamToResponse(res)
})

app.post('/api/chat/dev', async (req, res) => {
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

    const result = streamText({
        model,
        tools,
        messages: await convertToModelMessages(safeUiMessages),
        system: finalSystem,
        allowSystemInMessages: false,
        stopWhen,
        onStepFinish: logToolActivity
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

function createTools() {
    return {
        queryLogs: tool({
            name: 'queryLogs',
            description: 'Query logs from the backend with filters and pagination.',
            inputSchema: z.object({
                filters: z
                    .string()
                    .describe(
                        'FORMAT: "key:value" separated by spaces. 1. Use underscores for spaces (school:harvard_south). 2. Wildcards (*) allowed for Direct/Relational tags (id:30*, teacher:*), but NOT for Special tags (date, time, type, entity). 3. Use Relational tags (student, teacher, etc.) to find owners. 4. category: searches log metadata text. 5. Words without colons are free-text.'
                    ),
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
            }),
            execute: async ({ filters, page, perPage }) => {
                try {
                    const data = await queryLogs(filters, page, perPage)
                    return { success: true, data }
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error)
                    return { success: false, error: message }
                }
            }
        })
    }
}
