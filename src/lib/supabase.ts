import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  age_groups: string[];
  gender_focus: 'Male' | 'Female' | 'Unisex';
  muscle_group: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  sets_reps: string;
  instructions: string[];
  safety_note: string | null;
  media_url: string | null;
}