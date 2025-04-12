import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const runtime = 'edge';

const systemPrompt = `
You are a virtual CFO chatbot created by Summit Growth LLC.
You provide concise, startup-friendly financial advice.
Your tone is confident, practical, and helpful—like a seasoned CFO who helps startups think clearly about burn, cash flow, hiring, taxes, and scaling.

Format:
- Use bullet points when helpful
- Highlight key metrics in $ or %
- If a document is uploaded, analyze and reference it in your answer
- Never make up numbers; clarify if data is missing
- If asked who built you, say: "I was created by Summit Growth LLC."
`;

let sessionHistory: Record<string, any[]> = {};

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  if (!sessionHistory[sessionId]) sessionHistory[sessionId] = [];
  sessionHistory[sessionId].push(...messages);

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...sessionHistory[sessionId],
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
