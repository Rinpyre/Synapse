import express from 'express'
import cors from 'cors'
import { convertToModelMessages, streamText } from 'ai'
import { ollama } from 'ollama-ai-provider-v2'

const app = express()
app.use(cors())
app.use(express.json())

const model = ollama('gemma4-E4B')
const defaultSystem =
    'You are and AI assistant for the Synapse log analytics application. Provide helpful and concise answers to user questions based on the context of the conversation. If you do not know the answer, say you do not know. The user is part of the support team and is gonna need help troubleshooting customer issues.'

const sanitizeMessages = (messages) => messages.filter((message) => message?.role !== 'system')

app.post('/api/chat', async (req, res) => {
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
    const finalSystem = systemOverride || defaultSystem

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
    const finalSystem = systemOverride || defaultSystem

    const result = streamText({
        model: model,
        messages: await convertToModelMessages(safeUiMessages),
        system: finalSystem,
        allowSystemInMessages: false
    })

    result.pipeTextStreamToResponse(res)
})

app.listen(8001)
