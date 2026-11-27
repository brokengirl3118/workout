import { NextResponse } from 'next/server';

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const coachGender = body?.coachGender === 'male' ? 'male' : 'female';
    const history: ChatTurn[] = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ reply: '' }, { status: 200 });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json({ reply: '' }, { status: 200 });
    }

    const personaLabel =
      coachGender === 'male'
        ? 'Male Ninja (🥷) fitness & nutrition coach'
        : 'Female Bloom (🌸) fitness & nutrition coach';

    const systemInstruction = `You are a helpful, concise ${personaLabel} inside a fitness and wellness app for ages 0–90. Give clear, practical advice on workouts, muscle groups, mobility, calorie/protein gain combos, and daily health habits without medical diagnosis.`;

    const recentTurns = history
      .slice(-8)
      .filter((t) => t && typeof t.text === 'string' && t.text.trim().length > 0)
      .map((t) => ({
        role: t.role === 'model' ? 'model' : 'user',
        parts: [{ text: t.text.trim() }],
      }));

    const contents =
      recentTurns.length > 0
        ? recentTurns
        : [{ role: 'user', parts: [{ text: message }] }];

    const isBearerToken = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');
    const endpoint = isBearerToken
      ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          apiKey
        )}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (isBearerToken) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!geminiRes.ok) {
      return NextResponse.json({ reply: '' }, { status: 200 });
    }

    const data = await geminiRes.json().catch(() => null);
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p?.text || '')
        .join('')
        .trim() || '';

    return NextResponse.json({ reply }, { status: 200 });
  } catch {
    return NextResponse.json({ reply: '' }, { status: 200 });
  }
}