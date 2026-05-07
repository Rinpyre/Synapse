import express from 'express'
import cors from 'cors'
import { convertToModelMessages, streamText } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const promptPath = path.join(__dirname, 'system-prompt.md')
const cachedPrompt = fs.readFileSync(promptPath, 'utf-8')
const devMode = process.env.NODE_ENV !== 'production'
const model = ollama('qwen3.5:latest')
const app = express()
app.use(cors())
app.use(express.json())

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

    // Pass it to Vercel's streamText function, pointing it to Ollama
    const result = streamText({
        //? Model name/id as defined in `ollama list`
        model: model,
        messages: await convertToModelMessages(safeMessages),
        system: finalSystem,
        allowSystemInMessages: false
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
        model: model,
        messages: await convertToModelMessages(safeUiMessages),
        system: finalSystem,
        allowSystemInMessages: false
    })

    result.pipeTextStreamToResponse(res)
})

app.listen(8001)
