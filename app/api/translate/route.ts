import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const resp = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You are a translator. The user gives you a prompt in any language. You must return ONLY the English translation of that prompt, optimized for AI image/video generation. Add descriptive visual details. Return ONLY the translated and enhanced prompt, nothing else — no explanations, no quotes.',
        },
        { role: 'user', content: prompt },
      ],
    });
    const translated = resp.choices[0]?.message?.content?.trim() || prompt;
    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ translated: prompt });
  }
}
