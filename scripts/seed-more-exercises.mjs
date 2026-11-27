import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function buildFullDetails(name, muscle, category, equipment, level) {
  const m = muscle || 'Full Body';
  const cat = (category || 'Strength').toLowerCase();
  const eq = equipment || 'Bodyweight';

  const long_description = `${name} is a targeted ${cat} movement designed primarily to train your ${m} using ${eq.toLowerCase()}. Performing ${name} with full range of motion and steady breathing recruits deep stabilizing fibers while reinforcing joint alignment and posture. Consistent practice builds neuromuscular control, improves functional movement quality for daily life, and progressively strengthens the ${m.toLowerCase()} without unnecessary strain when paired with proper warm-up and recovery.`;

  const benefits = [
    `Directly strengthens and sculpts the ${m} with controlled tension.`,
    `Improves joint stability, balance, and posture during everyday movement.`,
    cat.includes('cardio') || cat.includes('plyo')
      ? 'Boosts heart health, calorie burn, and athletic stamina.'
      : cat.includes('stretch') || cat.includes('mobility')
      ? 'Relieves stiffness, increases flexibility, and speeds up muscle recovery.'
      : `Builds lean muscle definition and progressive ${level.toLowerCase()}-level strength.`,
    `Enhances mind-muscle connection and core bracing throughout every rep.`,
  ];

  const results_timeline = cat.includes('stretch') || cat.includes('mobility')
    ? 'Days 1–7: Noticeable relief in stiffness & easier joint movement • Days 14–21: Improved flexibility & posture • Days 30–45: Lasting mobility & pain-free range of motion.'
    : cat.includes('cardio') || cat.includes('plyo')
    ? 'Days 7–14: Higher daily energy & better breathing endurance • Days 21–30: Visible fat-loss support & sharper stamina • Days 45–60: Noticeable athletic conditioning & leaner physique.'
    : 'Days 7–14: Stronger mind-muscle connection & smoother form • Days 21–30: Measurable strength gains & firmer muscle tone • Days 45–60: Visible muscle definition, cuts, and size progress (with proper protein & sleep).';

  return { long_description, benefits, results_timeline };
}

async function run() {
  console.log('1) Fetching all currently saved exercises from Supabase...');
  const [r1, r2] = await Promise.all([
    supabase.from('exercises').select('*').range(0, 999),
    supabase.from('exercises').select('*').range(1000, 1999),
  ]);

  if (r1.error) {
    console.error('Error fetching existing exercises:', r1.error.message);
    return;
  }

  const existing = [...(r1.data || []), ...(r2.data || [])];
  const existingSlugs = new Set(existing.map((e) => e.slug));
  console.log(`Found ${existing.length} existing exercises. Adding full descriptions & timelines...`);

  const enrichedExisting = existing.map((ex) => {
    const details = buildFullDetails(
      ex.name,
      ex.muscle_group,
      ex.category,
      ex.equipment,
      ex.level || 'Intermediate'
    );
    return {
      ...ex,
      ...details,
    };
  });

  for (let i = 0; i < enrichedExisting.length; i += 100) {
    const batch = enrichedExisting.slice(i, i + 100);
    const { error } = await supabase.from('exercises').upsert(batch, { onConflict: 'slug' });
    if (error) console.error(`Enrich batch ${i} error:`, error.message);
    else console.log(`Updated existing: ${Math.min(i + 100, enrichedExisting.length)} / ${enrichedExisting.length}`);
  }

  console.log('2) Generating 1,050+ NEW unique exercises with full descriptions...');

  const muscleTemplates = [
    {
      muscle: 'Quadriceps',
      img1: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
      bases: ['Split Squat', 'Front Squat', 'Step-Up', 'Cyclist Squat', 'Hack Squat', 'Wall Sit', 'Lunge Pulse', 'Sissy Squat', 'Box Squat', 'Leg Extension'],
    },
    {
      muscle: 'Hamstrings',
      img1: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
      bases: ['Romanian Deadlift', 'Single-Leg RDL', 'Slider Leg Curl', 'Good Morning', 'Glute-Ham Raise', 'Bridge Walkout', 'Stiff-Leg Deadlift', 'Nordic Curl', 'Swiss Ball Curl', 'Seated Leg Curl'],
    },
    {
      muscle: 'Glutes',
      img1: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80',
      bases: ['Hip Thrust', 'Glute Bridge', 'Kickback', 'Curtsy Lunge', 'Frog Pump', 'Sumo Squat', 'Cable Pull-Through', 'Reverse Lunge', 'Step-Down', 'Single-Leg Thrust'],
    },
    {
      muscle: 'Calves',
      img1: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
      bases: ['Standing Calf Raise', 'Seated Calf Raise', 'Single-Leg Calf Raise', 'Donkey Calf Raise', 'Tibialis Raise', 'Pogo Calf Hop', 'Farmer Walk on Toes', 'Deficit Calf Raise'],
    },
    {
      muscle: 'Abductors',
      img1: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      bases: ['Clamshell', 'Lateral Band Walk', 'Side-Lying Leg Lift', 'Fire Hydrant', 'Standing Hip Abduction', 'Seated Band Abduction', 'Monster Walk'],
    },
    {
      muscle: 'Adductors',
      img1: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80',
      bases: ['Copenhagen Plank', 'Cossack Squat', 'Pillow Squeeze Bridge', 'Side-Lying Inner Thigh Lift', 'Wide Sumo Pulse', 'Standing Hip Adduction', 'Seated Adductor Squeeze'],
    },
    {
      muscle: 'Chest',
      img1: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
      bases: ['Bench Press', 'Incline Press', 'Chest Fly', 'Floor Press', 'Squeeze Press', 'Decline Push-Up', 'Chest Dip', 'Pullover', 'Svend Press', 'Landmine Chest Press'],
    },
    {
      muscle: 'Lats',
      img1: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
      bases: ['Lat Pulldown', 'Straight-Arm Pulldown', 'Single-Arm Row', 'Chin-Up', 'Meadows Row', 'Inverted Row', 'Seal Row', 'Chest-Supported Row', 'Pull-Up'],
    },
    {
      muscle: 'Middle back',
      img1: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&q=80',
      bases: ['Seated Cable Row', 'Bent-Over Row', 'T-Bar Row', 'Face Pull', 'Band Pull-Apart', 'Scapular Row', 'Prone Y-T-W Raise', 'Pendlay Row'],
    },
    {
      muscle: 'Lower back',
      img1: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
      bases: ['Back Extension', 'Superman Hold', 'Bird-Dog Reach', 'Reverse Hyperextension', 'Rack Pull', 'Swimmer Back Lift', 'Cat-Cow Spine Flow'],
    },
    {
      muscle: 'Traps',
      img1: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      bases: ['Power Shrug', 'Incline Trap Raise', 'Farmer Carry', 'Upright Row', 'Behind-Back Shrug', 'Overhead Shrug', 'Prone Trap Lift'],
    },
    {
      muscle: 'Shoulders',
      img1: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
      bases: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press', 'Lu Raise', 'Z-Press', 'Cuban Rotation', 'Landmine Press', 'Pike Press'],
    },
    {
      muscle: 'Biceps',
      img1: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      bases: ['Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Incline Curl', 'Concentration Curl', 'Spider Curl', 'Drag Curl', 'Zottman Curl', 'Bayesian Curl'],
    },
    {
      muscle: 'Triceps',
      img1: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
      bases: ['Tricep Pushdown', 'Overhead Tricep Extension', 'Skull Crusher', 'Close-Grip Press', 'Bench Dip', 'Tricep Kickback', 'Diamond Push-Up', 'JM Press'],
    },
    {
      muscle: 'Forearms',
      img1: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&q=80',
      bases: ['Wrist Curl', 'Reverse Wrist Curl', 'Dead Hang', 'Towel Hang', 'Plate Pinch Hold', 'Wrist Roller', 'Reverse Curl'],
    },
    {
      muscle: 'Abdominals',
      img1: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      bases: ['Hollow Hold', 'Hanging Knee Raise', 'Dead Bug', 'Pallof Press', 'Russian Twist', 'Ab Wheel Rollout', 'Bicycle Crunch', 'Side Plank', 'Cable Crunch', 'V-Sit Hold'],
    },
    {
      muscle: 'Neck',
      img1: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      bases: ['Chin Tuck', 'Isometric Neck Flexion', 'Isometric Neck Extension', 'Lateral Neck Tilt', 'Seated Neck Rotation', 'Prone Neck Nod'],
    },
    {
      muscle: 'Full Body',
      img1: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
      bases: ['Thruster', 'Turkish Get-Up', 'Clean and Press', 'Burpee Flow', 'Kettlebell Swing', 'Man Maker', 'Bear Crawl Sprint', 'Mountain Climber Flow', 'Jumping Squat'],
    },
  ];

  const modifiers = [
    { prefix: 'Tempo Slow', equip: 'Dumbbell', cat: 'Strength', level: 'Intermediate', sets: '4 sets x 10 reps (3s lower)', ages: ['18-39', '40-59'] },
    { prefix: 'Paused', equip: 'Barbell', cat: 'Strength', level: 'Advanced', sets: '4 sets x 6–8 reps (2s pause)', ages: ['18-39'] },
    { prefix: 'Banded', equip: 'Bands', cat: 'Strength', level: 'Beginner', sets: '3 sets x 15 reps', ages: ['13-17', '18-39', '40-59', '60-74'] },
    { prefix: 'Cable Controlled', equip: 'Cable', cat: 'Strength', level: 'Intermediate', sets: '4 sets x 12 reps', ages: ['18-39', '40-59'] },
    { prefix: 'Kettlebell', equip: 'Kettlebell', cat: 'Strength', level: 'Intermediate', sets: '4 sets x 10 reps', ages: ['18-39', '40-59'] },
    { prefix: 'Isometric Hold', equip: 'Bodyweight', cat: 'Mobility', level: 'Beginner', sets: '3 sets x 30 sec hold', ages: ['6-12', '13-17', '18-39', '40-59', '60-74'] },
    { prefix: 'Explosive Power', equip: 'Bodyweight', cat: 'Plyometrics', level: 'Advanced', sets: '4 sets x 8 explosive reps', ages: ['13-17', '18-39'] },
    { prefix: 'Chair-Assisted', equip: 'Chair', cat: 'Mobility', level: 'Beginner', sets: '2 sets x 12 reps', ages: ['60-74', '75-90'] },
    { prefix: '1.5-Rep Pump', equip: 'Dumbbell', cat: 'Strength', level: 'Intermediate', sets: '3 sets x 10 reps', ages: ['18-39', '40-59'] },
  ];

  const newExercises = [];

  for (const group of muscleTemplates) {
    for (const base of group.bases) {
      for (const mod of modifiers) {
        const name = `${mod.prefix} ${base}`;
        const slug = toSlug(name);
        if (existingSlugs.has(slug)) continue;
        existingSlugs.add(slug);

        const details = buildFullDetails(name, group.muscle, mod.cat, mod.equip, mod.level);

        newExercises.push({
          name,
          slug,
          age_groups: mod.ages,
          gender_focus: 'Unisex',
          muscle_group: group.muscle,
          category: mod.cat,
          level: mod.level,
          equipment: mod.equip,
          sets_reps: mod.sets,
          instructions: [
            `Prepare your posture and grip for ${name} using ${mod.equip.toLowerCase()}, bracing your core lightly.`,
            `Inhale as you lower or open into the starting range with smooth control.`,
            `Exhale and drive through your ${group.muscle.toLowerCase()} to reach peak contraction, pausing briefly before resetting.`,
          ],
          safety_note: 'Start with light resistance until your form feels smooth and joint-free of pain.',
          media_url: group.img1,
          media_url_2: group.img2,
          ...details,
        });
      }
    }
  }

  console.log(`Prepared ${newExercises.length} brand-new unique exercises. Uploading to Supabase...`);

  for (let i = 0; i < newExercises.length; i += 100) {
    const batch = newExercises.slice(i, i + 100);
    const { error } = await supabase.from('exercises').upsert(batch, { onConflict: 'slug' });
    if (error) console.error(`New batch ${i} error:`, error.message);
    else console.log(`Uploaded new: ${Math.min(i + 100, newExercises.length)} / ${newExercises.length}`);
  }

  console.log('ALL DONE! Existing exercises enriched + 1,000+ new exercises added.');
}

run();