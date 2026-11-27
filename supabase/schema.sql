-- 1. Exercises Table
create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  age_groups text[] not null,
  gender_focus text default 'Unisex',
  muscle_group text not null,
  category text not null,
  level text not null,
  equipment text not null,
  sets_reps text not null,
  instructions text[] not null,
  safety_note text,
  media_url text,
  created_at timestamptz default now()
);

alter table public.exercises enable row level security;
create policy "Public read exercises" on public.exercises for select using (true);

-- 2. AI Coach Sessions Table
create table if not exists public.ai_sessions (
  id uuid default gen_random_uuid() primary key,
  session_key text not null,
  coach_gender text not null check (coach_gender in ('male', 'female')),
  messages jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

alter table public.ai_sessions enable row level security;
create policy "Public insert/update ai_sessions" on public.ai_sessions for all using (true) with check (true);

-- 3. Seed Starter Genuine Exercises (0–90 Years)
insert into public.exercises (name, slug, age_groups, gender_focus, muscle_group, category, level, equipment, sets_reps, instructions, safety_note, media_url)
values
('Tummy Time', 'tummy-time', ARRAY['0-2'], 'Unisex', 'Neck & Core', 'Motor Play', 'Beginner', 'Bodyweight', '3–5 mins, 3x/day',
  ARRAY['Place infant on a firm, flat mat on their stomach while awake.', 'Place a colorful toy at eye level to encourage head lifting.', 'Always supervise closely.'],
  'Only perform when baby is awake and fully supervised.',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80'),

('Bear Crawl', 'bear-crawl', ARRAY['3-5', '6-12', '18-39'], 'Unisex', 'Full Body', 'Motor Play', 'Beginner', 'Bodyweight', '3 sets x 20 sec',
  ARRAY['Start on hands and knees with knees lifted 1 inch off the floor.', 'Move opposite hand and foot forward together.', 'Keep hips low and core tight.'],
  'Keep the surface clear and padded for young kids.',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80'),

('Jumping Jacks', 'jumping-jacks', ARRAY['6-12', '13-17', '18-39', '40-59'], 'Unisex', 'Full Body', 'Cardio', 'Beginner', 'Bodyweight', '3 sets x 30 sec',
  ARRAY['Stand tall with feet together and arms at your sides.', 'Jump feet out wide while raising arms overhead.', 'Jump back to start and repeat smoothly.'],
  'Land softly on the balls of your feet.',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80'),

('Bodyweight Goblet Squat', 'goblet-squat', ARRAY['13-17', '18-39', '40-59'], 'Unisex', 'Legs & Glutes', 'Strength', 'Beginner', 'Dumbbell', '3 sets x 12 reps',
  ARRAY['Hold a light dumbbell at chest height with elbows tucked.', 'Push hips back and bend knees until thighs are parallel to the floor.', 'Drive through your heels to stand tall.'],
  'Keep chest proud and knees tracking over toes.',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80'),

('Barbell Bench Press', 'barbell-bench-press', ARRAY['18-39', '40-59'], 'Male', 'Chest', 'Strength', 'Intermediate', 'Barbell', '4 sets x 8–10 reps',
  ARRAY['Lie flat on a bench with eyes under the bar and feet planted.', 'Grip slightly wider than shoulder-width and unrack.', 'Lower bar to mid-chest with elbows at 45 degrees, then press up.'],
  'Use a spotter or safety pins when lifting heavy.',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80'),

('Barbell Hip Thrust', 'barbell-hip-thrust', ARRAY['18-39', '40-59'], 'Female', 'Glutes', 'Strength', 'Intermediate', 'Barbell', '4 sets x 10–12 reps',
  ARRAY['Rest upper back against a bench with a padded barbell across your hips.', 'Drive through heels to lift hips until torso is parallel to the floor.', 'Squeeze glutes at the top for 1 second and lower with control.'],
  'Avoid overarching the lower back at the top.',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80'),

('Conventional Deadlift', 'conventional-deadlift', ARRAY['18-39'], 'Unisex', 'Back & Hamstrings', 'Strength', 'Advanced', 'Barbell', '4 sets x 5 reps',
  ARRAY['Stand with midfoot under the barbell, feet hip-width apart.', 'Hinge at hips, grip bar outside knees, flatten your back, and brace core.', 'Push the floor away with legs and lock out hips at the top.'],
  'Never round your lower back; start light to master the hip hinge.',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80'),

('Strict Pull-Ups', 'strict-pull-ups', ARRAY['13-17', '18-39', '40-59'], 'Unisex', 'Back & Biceps', 'Strength', 'Advanced', 'Bodyweight', '4 sets x 6–10 reps',
  ARRAY['Hang from a pull-up bar with palms facing away, shoulder-width apart.', 'Pull shoulder blades down and drive elbows toward ribs until chin clears bar.', 'Lower all the way down with control.'],
  'Avoid kipping or swinging your legs.',
  'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&q=80'),

('Dumbbell Romanian Deadlift', 'dumbbell-rdl', ARRAY['18-39', '40-59'], 'Unisex', 'Hamstrings & Glutes', 'Strength', 'Intermediate', 'Dumbbell', '3 sets x 10–12 reps',
  ARRAY['Hold dumbbells in front of thighs with a soft bend in the knees.', 'Hinge hips straight back while sliding weights close to your legs.', 'Stop when you feel a hamstring stretch, then drive hips forward.'],
  'Keep dumbbells close to your shins to protect your lower back.',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80'),

('Chair Sit-to-Stand', 'chair-sit-to-stand', ARRAY['60-74', '75-90'], 'Unisex', 'Legs', 'Balance', 'Beginner', 'Chair', '3 sets x 10 reps',
  ARRAY['Sit near the front edge of a sturdy chair with feet flat.', 'Lean slightly forward and stand up without using your hands if possible.', 'Slowly lower back down to the seat.'],
  'Place the chair against a wall so it cannot slide.',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80'),

('Seated Ankle Pumps & Marching', 'seated-ankle-pumps', ARRAY['75-90'], 'Unisex', 'Legs & Circulation', 'Mobility', 'Beginner', 'Chair', '2 sets x 15 reps',
  ARRAY['Sit upright in a sturdy chair with back supported.', 'Point toes down, then flex toes up toward your shins for ankle pumps.', 'Follow with slow alternating knee lifts (seated marching).'],
  'Move slowly and stop immediately if you feel dizzy.',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80')
on conflict (slug) do nothing;