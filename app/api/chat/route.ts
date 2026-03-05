import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Instantiate the provider pointing directly to the user's remote Ollama instance
const ollama = createOpenAI({
    baseURL: (process.env.OLLAMA_BASE_URL || 'http://45.198.59.91:11434/api').replace('/api', '/v1'),
    apiKey: 'ollama', // Required by SDK, but ignored by Ollama
});

export const maxDuration = 300;

/**
 * Convert v3 UIMessages to simple {role, content: string} objects.
 * glm-4.7-flash via Ollama does NOT support multi-part content arrays —
 * it requires plain string content. This handles both old SDK format
 * (m.content = string) and v3 format (m.parts = array).
 */
interface ChatPart {
    type: string;
    text?: string;
}

interface ChatMessage {
    role: string;
    content: string | ChatPart[];
    parts?: ChatPart[];
}

function toSimpleMessages(messages: ChatMessage[]): { role: 'user' | 'assistant'; content: string }[] {
    return messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => {
            let text = '';
            if (typeof m.content === 'string' && m.content.trim()) {
                text = m.content;
            } else if (Array.isArray(m.parts)) {
                // v3 SDK format: extract text from parts
                text = m.parts
                    .filter((p) => p.type === 'text')
                    .map((p) => p.text || '')
                    .join('');
            } else if (Array.isArray(m.content)) {
                // content-array format
                text = m.content
                    .filter((p) => (p as ChatPart).type === 'text')
                    .map((p) => (p as ChatPart).text || '')
                    .join('');
            }
            return { role: m.role as 'user' | 'assistant', content: text };
        })
        .filter((m) => m.content.trim() !== '');
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages = body.messages;
        const data = body.data;

        const codeContext = data?.code || "No code written yet.";
        const onboarding = data?.onboarding || {};

        const role = onboarding.role || 'General Software Engineer';
        const experience = onboarding.exp || 'Intermediate';
        const lang = onboarding.language || 'JavaScript';
        const difficulty = onboarding.difficulty || 'Medium';

        const simpleMessages = toSimpleMessages(messages);
        console.log('[CHAT] messages received:', messages?.length, '→ converted:', simpleMessages.length);
        console.log('[CHAT] last user msg:', simpleMessages[simpleMessages.length - 1]?.content?.substring(0, 120));

        const systemPrompt = `You are an expert Senior Software Engineer acting as a realistic technical interviewer conducting a mock coding interview.

## CANDIDATE PROFILE
- Target Role: ${role}
- Experience Level: ${experience}
- Preferred Language: ${lang}
- Difficulty Level: ${difficulty}
- Interview Focus: Tailor questions specifically for a ${role}. Frontend Developer → DOM, React, CSS, accessibility. Backend Developer → APIs, databases, system design. Full-Stack → both. DevOps → CI/CD, containers. Data Engineer → pipelines, SQL, distributed systems.

## YOUR BEHAVIOR — FOLLOW THESE RULES STRICTLY

### Phase 1: Greeting & First Question
When the candidate first joins, do the following in ONE message:
1. Greet them warmly and professionally.
2. Briefly acknowledge their target role and experience level.
3. Immediately present ONE realistic, coding-oriented technical interview question matching the difficulty and role.
4. Frame it as a real interviewer would: clear problem statement, example input/output, constraints.

### Phase 2: During the Interview
- Present ONLY ONE question at a time.
- If stuck, offer small progressive hints — never the full solution upfront.
- Ask follow-up questions: time complexity, edge cases, optimizations.
- Encourage writing and running code in the editor.

### Phase 3: Code Evaluation
When the candidate submits code or asks for review:
1. **What's Good** — acknowledge strengths first.
2. **Correctness** — identify bugs or logical errors.
3. **Edge Cases** — point out unhandled inputs.
4. **Efficiency** — time/space complexity, suggest optimizations.
5. **Improvements** — actionable specific suggestions.
6. Show an improved solution after discussion if applicable.
7. Ask if they want another question or to iterate.

### Phase 4: Interaction Rules
- Stay in character as an interviewer at all times.
- Never reveal the full solution before a genuine attempt.
- Keep responses concise and focused.
- Use markdown for code snippets.

--- CURRENT CODE EDITOR CONTEXT ---
${codeContext}
-----------------------------------`;

        const result = await streamText({
            model: ollama.chat(process.env.OLLAMA_MODEL || 'gpt-oss:latest'),
            messages: simpleMessages,
            system: systemPrompt,
        });

        console.log('[CHAT] Streaming response to client...');
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('[CHAT] CRITICAL ERROR:', error);
        return new Response(JSON.stringify({ error: 'Failed to communicate with AI Interviewer', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
