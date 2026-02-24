import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

// Instantiate the provider pointing directly to the user's remote Ollama instance using its OpenAI-compatibility wrapper
const ollama = createOpenAI({
    baseURL: (process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api').replace('/api', '/v1'),
    apiKey: 'ollama', // Required by SDK, but ignored by Ollama
});

// Configure the route for long-running streaming completions
export const maxDuration = 300;

export async function POST(req: Request) {
    try {
        const { messages, data } = await req.json();

        // Extract code context if provided in data
        const codeContext = data?.code || "No code written yet.";

        // Use GLM-4 model via the native Ollama provider
        const result = await streamText({
            model: ollama(process.env.OLLAMA_MODEL || 'glm-4.7-flash'),
            messages: await convertToModelMessages(messages),
            system: `You are an expert Senior Software Engineer acting as a technical interviewer.
You are evaluating a candidate's code. 
Be concise, helpful, and professional. 
If the user provides their code context, analyze it carefully. 
Do not immediately write the entire solution for them unless they explicitly ask for the final answer; instead, provide hints, pseudocode, and guide them toward the right logic.

--- CURRENT CANDIDATE CODE EDITOR CONTEXT ---
${codeContext}
-------------------------------------------`,
        });

        // Stream the result back to the React frontend
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('Ollama Streaming Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to communicate with AI Interviewer' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
