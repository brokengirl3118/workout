import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, coachGender, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { reply: 'Missing GEMINI_API_KEY in Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    const personaTone =
      coachGender === 'male'
        ? 'You are 🌸 (Male AI Coach) — energetic, direct, and concise.'
        : 'You are 🌸 (Female AI Coach) — supportive, sharp, and concise.';

    const systemPrompt = `${personaTone}
You are a global workout expert for ages 0–90. Keep replies short, fast, and practical (under 120 words unless asked for a full plan). Include genuine exercise names, sets/reps, and key form cues.`;

    const contents = [
      ...(history || []).slice(-4).map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        reply: `Gemini API Error (${res.status}): ${data?.error?.message || 'Unknown error'}`,
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response right now. Try again!';

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { reply: `Server Error: ${err instanceof Error ? err.message : 'Try again.'}` },
      { status: 500 }
    );
  }
}