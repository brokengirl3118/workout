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
      return NextResponse.json({ reply: '', error: 'Empty message' }, { status: 400 });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json(
        { reply: '', error: 'GEMINI_API_KEY is not set in environment variables.' },
        { status: 500 }
      );
    }

    const persona =
      coachGender === 'male'
        ? 'Male Ninja (🥷) fitness & nutrition coach'
        : 'Female Bloom (🌸) fitness & nutrition coach';

    const systemInstruction = `You are a helpful, concise ${persona} for a fitness and wellness app. Give practical workout, mobility, hydration, and calorie/protein guidance without giving medical diagnoses.`;

    const formattedHistory = history
      .slice(-8)
      .filter((item) => item && typeof item.text === 'string' && item.text.trim().length > 0)
      .map((item) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.text.trim() }],
      }));

    const contents =
      formattedHistory.length > 0
        ? formattedHistory
        : [{ role: 'user', parts: [{ text: message }] }];

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 700,
        },
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const apiMsg =
        data?.error?.message || `Gemini API returned HTTP ${response.status}`;
      return NextResponse.json({ reply: '', error: apiMsg }, { status: response.status });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text || '')
        .join('')
        .trim() || '';

    if (!reply) {
      return NextResponse.json(
        { reply: '', error: 'Gemini returned an empty response.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Request failed';
    return NextResponse.json({ reply: '', error: detail }, { status: 500 });
  }
}