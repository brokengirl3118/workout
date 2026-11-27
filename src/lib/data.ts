export const AGE_GROUPS = [
  { id: 'all', label: 'All Ages (0–90)', subtitle: 'Complete catalog' },
  { id: '0-2', label: '0–2 yrs', subtitle: 'Infants & Toddlers' },
  { id: '3-5', label: '3–5 yrs', subtitle: 'Preschool Kids' },
  { id: '6-12', label: '6–12 yrs', subtitle: 'Children' },
  { id: '13-17', label: '13–17 yrs', subtitle: 'Teens' },
  { id: '18-39', label: '18–39 yrs', subtitle: 'Overall Full Library' },
  { id: '40-59', label: '40–59 yrs', subtitle: 'Mature Adults' },
  { id: '60-74', label: '60–74 yrs', subtitle: 'Active Seniors' },
  { id: '75-90', label: '75–90 yrs', subtitle: 'Gentle Seniors' },
] as const;

export type LevelKey = 'Beginner' | 'Intermediate' | 'Advanced';

export const READINESS_QUESTIONS: Record<'Intermediate' | 'Advanced', string[]> = {
  Intermediate: [
    'Can you perform 15 strict push-ups (or 10 full-depth knee push-ups) with clean form?',
    'Can you perform 25 bodyweight squats without your knees caving inward?',
    'Can you hold a 60-second forearm plank without your lower back sagging?',
    'Have you trained consistently for at least 3–6 months?',
  ],
  Advanced: [
    'Can you perform 30+ strict push-ups or bench press close to your bodyweight?',
    'Can you perform 8–10 strict pull-ups without swinging?',
    'Can you safely perform barbell compounds (Squat, Deadlift, RDL) with controlled form?',
    'Have you trained consistently for 1+ year?',
  ],
};

export const TRUSTED_GUIDES: Record<
  LevelKey,
  { title: string; split: string; rules: string[]; weeklyPlan: string[] }
> = {
  Beginner: {
    title: 'Beginner Trusted Guide (Foundation & Form)',
    split: '3 Days / Week — Full Body',
    rules: [
      'Focus 100% on controlled form before adding heavy weight.',
      'Rest 60–90 seconds between sets and breathe out on exertion.',
      'Stop 2–3 reps before failure to avoid extreme soreness or injury.',
    ],
    weeklyPlan: [
      'Day 1: Goblet Squats, Push-Ups, Dumbbell Rows, Forearm Plank',
      'Day 2: Rest or 20-min brisk walk',
      'Day 3: Glute Bridges, Overhead Press, Lat Pulldown, Dead Bug',
      'Day 4: Rest or light mobility stretching',
      'Day 5: Lunges, Incline Push-Ups, Banded Pull-Aparts, Bird-Dog',
    ],
  },
  Intermediate: {
    title: 'Intermediate Trusted Guide (Progressive Overload)',
    split: '4 Days / Week — Upper / Lower Split',
    rules: [
      'Track your weights and reps every session; aim to add 1 rep or 2.5 kg weekly.',
      'Start every workout with heavy compound lifts before isolation moves.',
      'Take a deload week (lighter weights) every 6–8 weeks.',
    ],
    weeklyPlan: [
      'Day 1 (Upper): Barbell Bench Press, Pull-Ups, Overhead Press, Cable Rows',
      'Day 2 (Lower): Back Squat, Dumbbell RDL, Walking Lunges, Calf Raises',
      'Day 3: Active Recovery / Cardio',
      'Day 4 (Upper): Incline Dumbbell Press, Barbell Row, Lateral Raises, Arms',
      'Day 5 (Lower): Hip Thrust, Bulgarian Split Squat, Leg Curl, Hanging Leg Raise',
    ],
  },
  Advanced: {
    title: 'Advanced Trusted Guide (Specialization & Peak Performance)',
    split: '5–6 Days / Week — Push / Pull / Legs',
    rules: [
      'Train close to failure (RPE 8–9) on final working sets.',
      'Use periodization: alternate 4-week strength blocks with hypertrophy blocks.',
      'Prioritize 7–9 hours of sleep, protein intake, and daily joint mobility.',
    ],
    weeklyPlan: [
      'Day 1 (Push): Barbell Bench, Overhead Press, Weighted Dips, Lateral Raises',
      'Day 2 (Pull): Conventional Deadlift, Weighted Pull-Ups, Chest-Supported Row, Face Pulls',
      'Day 3 (Legs): Barbell Squat, Hip Thrust, RDL, Leg Extensions, Core',
      'Day 4–6: Repeat Push / Pull / Legs with hypertrophy rep ranges (8–15 reps)',
    ],
  },
};