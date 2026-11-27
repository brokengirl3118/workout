import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { message, coachGender, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { reply: 'Please add your GEMINI_API_KEY in Vercel Environment Variables to activate 🌸 AI Coach.' },
        { status: 500 }
      );
    }

    // Fetch matching exercises from Supabase so 🌸 can reference site exercises
    const { data: matchedExercises } = await supabase
      .from('exercises')
      .select('name, age_groups, level, muscle_group, sets_reps')
      .ilike('name', `%${message.split(' ').slice(0, 3).join(' ')}%`)
      .limit(3);

    const personaTone =
      coachGender === 'male'
        ? 'You are 🌸 (Male AI Coach version) — energetic, structured, encouraging, and direct.'
        : 'You are 🌸 (Female AI Coach version) — supportive, sharp, motivating, and detail-oriented.';

    const systemPrompt = `${personaTone}
You have complete global expertise in every workout, gym lift, calisthenics move, yoga/Pilates pose, kids motor drill (0-12), teen athletic training (13-17), adult fitness (18-59), and senior chair/mobility exercise (60-90).
Always provide:
1. Genuine exercise names & target muscles
2. Clear step-by-step form cues & breathing
3. Recommended sets/reps & age-safe modifications
4. Short safety tips. Keep responses well-formatted and practical.
Site database matches (mention if relevant): ${JSON.stringify(matchedExercises || [])}`;

    const contents = [
      ...(history || []).slice(-6).map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
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
      { reply: `Server Error: ${err instanceof Error ? err.message : 'Check your GEMINI_API_KEY and try again.'}` },
      { status: 500 }
    );
  }
}