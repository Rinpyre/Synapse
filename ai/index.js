import express from 'express'
import { streamText } from 'ai'
import { ollama } from 'ollama-ai-provider'

const app = express()
app.use(express.json())

app.post('/api/chat', async (req, res) => {
    // Get the messages array sent from the React frontend
    const { messages } = req.body

    // Pass it to Vercel's streamText function, pointing it to Ollama
    const result = await streamText({
        //? Model name/id as defined in `ollama list`
        model: ollama('llama3'),
        messages: messages,
        system: 'You are Synapse AI...' // TODO: We will inject logs here!
    })

    // Vercel pipes the streaming response directly back to React
    result.pipeTextStreamToResponse(res)
})

app.listen(8001)
