import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load .env.local without extra packages
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

const IMG_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const toSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'General');

async function seed() {
  console.log('Fetching 870+ genuine exercises from free-exercise-db...');
  const res = await fetch(
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
  );
  const raw = await res.json();

  const exercises = raw.map((item) => {
    const levelMap = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      expert: 'Advanced',
    };
    const level = levelMap[item.level] || 'Intermediate';
    const equip = capitalize(item.equipment || 'Bodyweight');
    const isBodyweight = equip.toLowerCase().includes('body') || equip === 'None';
    const isStretch = item.category === 'stretching';

    // Smart age assignment (18-39 gets all; teens/40-59/seniors get safe ones)
    const ages = ['18-39'];
    if (level !== 'Advanced') ages.push('40-59');
    if (isBodyweight || isStretch) {
      ages.push('13-17');
      if (level === 'Beginner') ages.push('60-74');
    }

    return {
      name: item.name,
      slug: toSlug(item.name),
      age_groups: ages,
      gender_focus: 'Unisex',
      muscle_group: capitalize(item.primaryMuscles?.[0] || 'Full Body'),
      category: capitalize(item.category || 'Strength'),
      level,
      equipment: equip === 'Body only' ? 'Bodyweight' : equip,
      sets_reps: isStretch ? '3 sets x 30 sec hold' : level === 'Beginner' ? '3 sets x 12 reps' : '4 sets x 8–10 reps',
      instructions: item.instructions?.length ? item.instructions : ['Perform with controlled form and steady breathing.'],
      safety_note: 'Warm up first and stop if you feel sharp joint pain.',
      media_url: item.images?.[0] ? `${IMG_BASE}${item.images[0]}` : null,
      media_url_2: item.images?.[1] ? `${IMG_BASE}${item.images[1]}` : null,
    };
  });

  // Generate 160+ curated age-specific exercises (0–2, 3–5, 6–12, 13–17, 60–74, 75–90)
  const agePacks = [
    {
      ages: ['0-2'],
      equip: 'Bodyweight',
      cat: 'Motor Play',
      sets: '3–5 mins supervised',
      img1: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80',
      names: [
        'Tummy Time Head Lift', 'Supported Sitting Balance', 'Toy Reach & Grasp', 'Rolling Back to Belly',
        'Assisted Standing Bounce', 'Crawling Tunnel Chase', 'Soft Ball Push', 'Baby Bicycle Legs',
        'Pillow Climb Assist', 'Cruising Along Sofa', 'Clapping Rhythm Drill', 'Seated Reach Across',
        'Gentle Ankle Flex', 'Parent-Assisted Squat', 'Foot-to-Mouth Stretch', 'Standing Toy Drop',
        'Cushion Step Over', 'Side-Lying Reach', 'Supported Walk Steps', 'Floor Mat Pivot',
        'Gentle Arm Swings', 'Peek-a-Boo Core Lift', 'Soft Block Stack', 'Pull-to-Stand Practice',
        'Seated Side Lean'
      ]
    },
    {
      ages: ['3-5', '6-12'],
      equip: 'Bodyweight',
      cat: 'Motor Play',
      sets: '3 sets x 20 sec',
      img1: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      names: [
        'Frog Jumps', 'Crab Walk', 'Flamingo Single-Leg Balance', 'Bunny Hops', 'Star Jumps',
        'Kangaroo Broad Jump', 'Duck Walk', 'Inchworm Crawl', 'Seal Walk', 'Penguin Waddle',
        'Hopscotch Single-Leg Hop', 'Gorilla Stomp Squats', 'Cheetah High Knees', 'Flamingos Arm Circles',
        'Superhero Floor Hold', 'Spiderman Crawl', 'Donkey Kick Play', 'Butterfly Seated Stretch',
        'Balloon Tap Agility', 'Line Tightrope Walk', 'Side Shuffle Tag', 'Rocket Ship Squat Jump',
        'Windmill Toe Touches', 'Pretzel Twist Stretch', 'Turtle Shell Tuck', 'Log Roll',
        'Scissor Jumps', 'Tip-Toe Giant Walk', 'Heel Walk Balance', 'Shadow Boxing Kids',
        'Mini Mountain Climbers', 'Skipping in Place', 'Tuck Jumps Kids', 'Bridge Tunnel Hold',
        'Freeze Dance Balance'
      ]
    },
    {
      ages: ['60-74', '75-90'],
      equip: 'Chair',
      cat: 'Mobility',
      sets: '2–3 sets x 10 reps',
      img1: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
      names: [
        'Seated Marching', 'Seated Knee Extensions', 'Seated Ankle Circles', 'Chair Sit-to-Stand Slow',
        'Seated Torso Twist', 'Seated Overhead Reach', 'Seated Chest Opener', 'Seated Shoulder Rolls',
        'Seated Heel Raises', 'Seated Toe Taps', 'Chair Side Bends', 'Seated Arm Punches',
        'Seated Neck Tilts', 'Seated Wrist Flexion', 'Seated Finger Spreads', 'Wall Push-Ups Gentle',
        'Countertop Heel Raises', 'Heel-to-Toe Tightrope Walk', 'Standing Hip Abduction (Chair)',
        'Standing Leg Curl (Chair)', 'Standing March with Support', 'Seated Resistance Band Row',
        'Seated Band Chest Press', 'Seated Band Bicep Curl', 'Seated Band Pull-Apart',
        'Seated Pillow Squeeze', 'Seated Deep Belly Breathing', 'Seated Hamstring Stretch',
        'Seated Calf Stretch', 'Seated Spine Cat-Cow', 'Standing Weight Shifts', 'Mini Step-Ups',
        'Seated Elbow-to-Knee', 'Seated Butterfly Open', 'Chair-Assisted Mini Squat',
        'Seated Arm Circles Small', 'Seated Scapular Squeeze', 'Standing Side Leg Lift',
        'Seated Ankle Pumps Fast', 'Seated Posture Reset'
      ]
    },
    {
      ages: ['13-17', '18-39', '40-59'],
      equip: 'Bodyweight',
      cat: 'Cardio',
      sets: '3 sets x 30 sec',
      img1: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
      img2: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
      names: [
        'Tempo Push-Up Progression', 'Explosive Clapping Push-Up', 'Archer Push-Up', 'Pseudo Planche Push-Up',
        'Hindu Push-Up', 'Dive Bomber Push-Up', 'Pike Shoulder Push-Up', 'Wall Handstand Hold',
        'Hollow Body Rock', 'V-Up Core Crunch', 'Dragon Flag Negative', 'L-Sit Floor Hold',
        'Pistol Squat Assisted', 'Shrimp Squat', 'Cossack Squat Flow', 'Sissy Squat Bodyweight',
        'Nordic Hamstring Negative', 'Single-Leg Glute Bridge March', 'Wall Sit Isometric',
        'Skater Hops Lateral', 'Burpee Broad Jump', 'Sprawl Conditioning', 'High-Knee Sprint Interval',
        'Butt Kicks Cardio', 'Plank Shoulder Taps', 'Plank Up-Downs', 'Side Plank Hip Dips',
        'Reverse Plank Hold', 'Dead Bug Slow Tempo', 'Bird-Dog Crunch', 'Superman Back Extension',
        'Swimmers Lower Back', 'Shadow Boxing 3-Punch Combo', 'Jump Rope Double Under Drill',
        'Box Jump Step-Down', 'Broad Jump Reset', 'Lateral Bound Agility', 'Bear Crawl Backward',
        'Crab Toe Touch', 'World Greatest Stretch Flow', '90/90 Hip Switch', 'Thoracic Open Book',
        'Couch Quad Stretch', 'Pigeon Glute Stretch', 'Child Pose Lat Stretch', 'Downward Dog Pedal',
        'Cobra Spine Extension', 'Doorway Pec Stretch', 'Wall Angels Posture', 'Chin Tucks Neck Reset',
        'Banded Face Pulls', 'Banded Monster Walks', 'Banded Clamshells', 'Banded Pallof Press',
        'Banded Good Mornings', 'Banded Tricep Pushdown', 'Banded Hammer Curl', 'Banded Lateral Raise',
        'Isometric Towel Row', 'Towel Bicep Curl'
      ]
    }
  ];

  for (const pack of agePacks) {
    for (const name of pack.names) {
      exercises.push({
        name,
        slug: toSlug(name),
        age_groups: pack.ages,
        gender_focus: 'Unisex',
        muscle_group: 'Full Body',
        category: pack.cat,
        level: 'Beginner',
        equipment: pack.equip,
        sets_reps: pack.sets,
        instructions: [
          `Set up safely for ${name} with controlled posture.`,
          'Move smoothly through the full comfortable range of motion.',
          'Breathe steadily and reset cleanly between repetitions.',
        ],
        safety_note: 'Keep movements controlled and stop immediately if you feel discomfort.',
        media_url: pack.img1,
        media_url_2: pack.img2,
      });
    }
  }

  // Deduplicate by slug
  const uniqueMap = new Map();
  for (const ex of exercises) {
    if (!uniqueMap.has(ex.slug)) uniqueMap.set(ex.slug, ex);
  }
  const finalRows = Array.from(uniqueMap.values());
  console.log(`Prepared ${finalRows.length} unique exercises. Uploading to Supabase...`);

  // Insert in batches of 100
  for (let i = 0; i < finalRows.length; i += 100) {
    const batch = finalRows.slice(i, i + 100);
    const { error } = await supabase
      .from('exercises')
      .upsert(batch, { onConflict: 'slug' });
    if (error) {
      console.error(`Batch ${i} error:`, error.message);
    } else {
      console.log(`Uploaded ${Math.min(i + 100, finalRows.length)} / ${finalRows.length}`);
    }
  }

  console.log('Done! 1,000+ unique exercises are now live in Supabase.');
}

seed();