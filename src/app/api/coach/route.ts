import { NextResponse } from 'next/server';

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

const CREATOR_REGEX =
  /\b(who (created|made|built|designed|programmed|developed) you|who is your creator|your maker|who made this ai)\b/i;

function buildFriendlyReply(message: string, coachGender: 'male' | 'female'): string {
  const icon = coachGender === 'male' ? '🥷' : '🌸';
  const q = message.toLowerCase();

  if (CREATOR_REGEX.test(message)) {
    return `${icon} I was created by Harsh's wife.`;
  }

  if (
    q.includes('protein') ||
    q.includes('calorie') ||
    q.includes('gain') ||
    q.includes('diet') ||
    q.includes('eat') ||
    q.includes('food') ||
    q.includes('dry fruit') ||
    q.includes('fruit')
  ) {
    return `${icon} Easy Calorie & Protein Gain Plan:
• Shake (~680 kcal, 26g protein): 2 bananas + 1 glass milk + 2 tbsp peanut butter + 50g oats.
• Meal (~650 kcal, 34g protein): 150g paneer or 60g soya chunks + rice or roti + curd.
• Dry fruits & fruits (~430 kcal): Almonds, peanuts, cashews, dates, walnuts, banana, or mango.
• Simple rule: Eat 3–4 steady meals, drink water through the day, and aim for about 1.6–2g protein per kg of body weight.`;
  }

  if (q.includes('water') || q.includes('hydrat') || q.includes('drink')) {
    return `${icon} Simple Hydration Tip:
• Keep a water bottle near you and sip steadily all day.
• Drink 1 glass after waking up and extra water after workouts or hot weather.
• Use the Water Today counter on Home or in Maintainer to track every glass.`;
  }

  if (
    q.includes('leg') ||
    q.includes('squat') ||
    q.includes('glute') ||
    q.includes('calf') ||
    q.includes('chest') ||
    q.includes('back') ||
    q.includes('arm') ||
    q.includes('workout') ||
    q.includes('exercise')
  ) {
    return `${icon} Easy Workout Steps:
1. Warm up for 5 minutes with light movement and gentle joint circles.
2. Do 3–4 sets of 8–12 smooth reps with 60–90 seconds of rest between sets.
3. Breathe out on effort, keep your posture tall, and stop if you feel sharp pain.
Tell me which body part, goal, or age group you want and I can break it down step by step.`;
  }

  if (q.includes('sleep') || q.includes('rest') || q.includes('stress') || q.includes('tired')) {
    return `${icon} Calm & Recovery Guide:
• Try 4-4-4-4 box breathing or the Calm Breath card on Home for 1–2 minutes.
• Stretch tight neck, shoulder, hip, and back muscles gently.
• Aim for 7–9 hours of sleep and keep screens low before bed.`;
  }

  return `${icon} Here is an easy way to handle "${message.trim()}":
• Start small and stay consistent—even 10–20 minutes counts.
• Pair your movement with enough water, balanced food, and good rest.
• Ask me about any exercise, muscle group, calorie/protein food combo, or daily routine!`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const coachGender = body?.coachGender === 'male' ? 'male' : 'female';
    const history: ChatTurn[] = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ reply: '', error: 'Please type a message.' }, { status: 400 });
    }

    if (CREATOR_REGEX.test(message)) {
      const icon = coachGender === 'male' ? '🥷' : '🌸';
      return NextResponse.json({ reply: `${icon} Harsh's wife.` }, { status: 200 });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json(
        { reply: buildFriendlyReply(message, coachGender) },
        { status: 200 }
      );
    }

    const persona =
      coachGender === 'male'
        ? 'Male Ninja (🥷) friendly coach'
        : 'Female Bloom (🌸) friendly coach';

    const systemInstruction = `You are a warm, clear, easy-to-understand ${persona} inside a fitness and wellness app for ages 0–90. Explain things in simple, everyday language with practical workout, hydration, and calorie/protein food suggestions. If the user asks who created, made, or built you, answer clearly: Harsh's wife. Never give medical diagnoses.`;

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
      return NextResponse.json(
        { reply: buildFriendlyReply(message, coachGender) },
        { status: 200 }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text || '')
        .join('')
        .trim() || '';

    if (!reply) {
      return NextResponse.json(
        { reply: buildFriendlyReply(message, coachGender) },
        { status: 200 }
      );
    }

    return NextResponse.json({ reply }, { status: 200 });
  } catch {
    return NextResponse.json(
      { reply: "🌸 I'm here to help with workouts, water, and calorie & protein tips!" },
      { status: 200 }
    );
  }
}