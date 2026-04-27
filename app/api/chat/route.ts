import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

/* ─── Lazy-init client ─── */
let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/* ─── System Prompt ─── */
const SYSTEM_PROMPT = `You are ASENA AI — a highly capable, friendly, and intelligent assistant.

LANGUAGE RULE (CRITICAL):
- Detect the language of each user message.
- ALWAYS respond in the EXACT SAME language the user used.
- If user writes in Uzbek → respond in Uzbek (O'zbek tilida)
- If user writes in English → respond in English
- If user writes in Russian → respond in Russian (на русском)
- If user writes in Arabic → respond in Arabic (بالعربية)
- If user writes in Chinese → respond in Chinese (用中文回复)
- And so on for ALL languages.

PERSONALITY:
- Helpful, accurate, and concise
- Friendly but professional
- Use markdown formatting when helpful (bold, code blocks, lists)
- Be direct and clear

CAPABILITIES:
- Answer questions on any topic
- Help with coding, writing, analysis
- Explain complex topics simply
- Creative writing and brainstorming
- Math and logic problems`;

/* ─── POST handler ─── */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 },
      );
    }

    const groq = getGroq();

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.9,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              const payload = `data: ${JSON.stringify({ text })}\n\n`;
              controller.enqueue(encoder.encode(payload));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          const errPayload = `data: ${JSON.stringify({ error: String(err) })}\n\n`;
          controller.enqueue(encoder.encode(errPayload));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('[ASENA AI API Error]', err);

    /* Friendly error for missing API key */
    if (err.message?.includes('GROQ_API_KEY')) {
      return NextResponse.json(
        {
          error:
            'GROQ_API_KEY topilmadi. Iltimos .env.local faylida GROQ_API_KEY ni o\'rnating.',
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'Ichki server xatosi. Qaytadan urinib ko\'ring.' },
      { status: 500 },
    );
  }
}
