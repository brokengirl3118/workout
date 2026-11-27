import { Exercise } from './supabase';

export interface BodyPartCategory {
  id: string;
  label: string;
  emoji: string;
  muscles: string[]; // A-Z muscle names
}

export const BODY_PART_CATEGORIES: BodyPartCategory[] = [
  {
    id: 'all',
    label: 'All Body Parts',
    emoji: '✨',
    muscles: [],
  },
  {
    id: 'legs',
    label: 'Legs',
    emoji: '🦵',
    muscles: ['Abductors', 'Adductors', 'Calves', 'Glutes', 'Hamstrings', 'Quadriceps'],
  },
  {
    id: 'chest',
    label: 'Chest',
    emoji: '🛡️',
    muscles: ['Chest'],
  },
  {
    id: 'back',
    label: 'Back & Neck',
    emoji: '🦅',
    muscles: ['Lats', 'Lower back', 'Middle back', 'Neck', 'Traps'],
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    emoji: '🏔️',
    muscles: ['Shoulders'],
  },
  {
    id: 'arms',
    label: 'Arms',
    emoji: '💪',
    muscles: ['Biceps', 'Forearms', 'Triceps'],
  },
  {
    id: 'core',
    label: 'Core & Abs',
    emoji: '🔥',
    muscles: ['Abdominals'],
  },
  {
    id: 'fullbody',
    label: 'Full Body',
    emoji: '⚡',
    muscles: ['Full Body'],
  },
];

export const TARGET_GOALS = [
  { id: 'all', label: 'All Targets', tip: '' },
  { id: 'bulky', label: '🏋️ Bulky (Mass & Size)', tip: '4 sets × 6–10 heavy reps • 90s rest' },
  { id: 'cuts', label: '✂️ Lean & Muscle Cuts', tip: '4 sets × 12–15 reps • 45s rest' },
  { id: 'strength', label: '⚡ Pure Strength', tip: '5 sets × 3–5 reps • 2–3 min rest' },
  { id: 'toning', label: '✨ Toning & Shape', tip: '3 sets × 12–15 controlled reps' },
  { id: 'mobility', label: '🧘 Flexibility & Mobility', tip: '3 sets × 30–45 sec holds' },
  { id: 'stamina', label: '🫀 Stamina & Fat Burn', tip: '3–4 rounds × 30–45 sec work' },
] as const;

export const TIME_OF_DAY_OPTIONS = [
  { id: 'all', label: 'Any Time', emoji: '🕒' },
  { id: 'morning', label: 'Morning', emoji: '🌅' },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { id: 'evening', label: 'Evening', emoji: '🌆' },
  { id: 'night', label: 'Night', emoji: '🌙' },
] as const;

export function matchesBodyPart(ex: Exercise, bodyPartId: string, specificMuscle: string): boolean {
  const m = (ex.muscle_group || '').toLowerCase();

  if (specificMuscle !== 'all') {
    return m.includes(specificMuscle.toLowerCase());
  }

  if (bodyPartId === 'all') return true;
  const group = BODY_PART_CATEGORIES.find((b) => b.id === bodyPartId);
  if (!group) return true;

  if (bodyPartId === 'legs' && m.includes('leg')) return true;
  if (bodyPartId === 'back' && m.includes('back')) return true;
  if (bodyPartId === 'core' && (m.includes('ab') || m.includes('core'))) return true;

  return group.muscles.some((mus) => m.includes(mus.toLowerCase()));
}

export function matchesTargetGoal(ex: Exercise, goalId: string): boolean {
  if (goalId === 'all') return true;
  const cat = (ex.category || '').toLowerCase();
  const equip = (ex.equipment || '').toLowerCase();
  const lvl = (ex.level || '').toLowerCase();

  switch (goalId) {
    case 'bulky':
      return (
        cat.includes('strength') ||
        cat.includes('strongman') ||
        equip.includes('barbell') ||
        equip.includes('dumbbell') ||
        equip.includes('cable') ||
        equip.includes('machine')
      );
    case 'cuts':
      return (
        cat.includes('cardio') ||
        cat.includes('plyometrics') ||
        equip.includes('bodyweight') ||
        equip.includes('dumbbell') ||
        equip.includes('kettlebell')
      );
    case 'strength':
      return (
        cat.includes('powerlifting') ||
        cat.includes('strongman') ||
        cat.includes('olympic') ||
        (cat.includes('strength') && (equip.includes('barbell') || lvl === 'advanced'))
      );
    case 'toning':
      return (
        lvl === 'beginner' ||
        lvl === 'intermediate' ||
        equip.includes('bands') ||
        equip.includes('cable') ||
        equip.includes('bodyweight')
      );
    case 'mobility':
      return (
        cat.includes('stretching') ||
        cat.includes('mobility') ||
        cat.includes('motor') ||
        equip.includes('chair') ||
        equip.includes('foam')
      );
    case 'stamina':
      return (
        cat.includes('cardio') ||
        cat.includes('plyometrics') ||
        cat.includes('motor') ||
        equip.includes('bodyweight')
      );
    default:
      return true;
  }
}

export function matchesTimeOfDay(ex: Exercise, timeId: string): boolean {
  if (timeId === 'all') return true;
  const cat = (ex.category || '').toLowerCase();
  const equip = (ex.equipment || '').toLowerCase();
  const lvl = (ex.level || '').toLowerCase();

  switch (timeId) {
    case 'morning':
      // Energizing cardio, mobility, bodyweight, stretching
      return (
        cat.includes('cardio') ||
        cat.includes('stretching') ||
        cat.includes('mobility') ||
        cat.includes('motor') ||
        equip.includes('bodyweight')
      );
    case 'afternoon':
      // Peak body strength: heavy lifts, barbell, machine, strength
      return (
        cat.includes('strength') ||
        cat.includes('powerlifting') ||
        cat.includes('olympic') ||
        equip.includes('barbell') ||
        equip.includes('machine')
      );
    case 'evening':
      // Hypertrophy, pump, dumbbell, cable, plyometrics
      return (
        cat.includes('strength') ||
        cat.includes('plyometrics') ||
        cat.includes('cardio') ||
        equip.includes('dumbbell') ||
        equip.includes('cable') ||
        equip.includes('kettlebell')
      );
    case 'night':
      // Calm recovery, stretching, chair, gentle beginner mobility
      return (
        cat.includes('stretching') ||
        cat.includes('mobility') ||
        equip.includes('chair') ||
        (equip.includes('bodyweight') && lvl === 'beginner')
      );
    default:
      return true;
  }
}