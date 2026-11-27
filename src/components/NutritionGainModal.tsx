'use client';

import { useState } from 'react';
import { X, Flame, Plus, RotateCcw, Utensils } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  emoji: string;
  note: string;
  group: 'combos' | 'dryfruits' | 'fruits' | 'foods';
}

const FOOD_LIST: FoodItem[] = [
  // HIGH-CALORIE & HIGH-PROTEIN COMBINATIONS
  {
    id: 'c1',
    name: 'Power Weight-Gain Shake',
    portion: '2 Bananas + 1 Glass Milk + 2 tbsp Peanut Butter + 50g Oats + 5 Almonds',
    calories: 680,
    protein: 26,
    emoji: '🥤',
    note: 'Best post-workout or morning gainer combo.',
    group: 'combos',
  },
  {
    id: 'c2',
    name: 'Paneer & Ghee Roti Plate',
    portion: '150g Paneer Bhurji + 3 Ghee Rotis + 1 Bowl Curd',
    calories: 720,
    protein: 36,
    emoji: '🍛',
    note: 'Rich vegetarian muscle-building lunch/dinner.',
    group: 'combos',
  },
  {
    id: 'c3',
    name: 'Soya & Rice Power Bowl',
    portion: '60g Soya Chunks + 1.5 Cup Cooked Rice + 1 tsp Ghee',
    calories: 560,
    protein: 34,
    emoji: '🍚',
    note: 'Budget-friendly high-protein mass builder.',
    group: 'combos',
  },
  {
    id: 'c4',
    name: 'Dry Fruit & Dates Energy Mix',
    portion: '10 Almonds + 10 Cashews + 4 Dates + 2 Walnuts + 1 tbsp Raisins',
    calories: 430,
    protein: 11,
    emoji: '🥜',
    note: 'Easy 400+ calories anytime during study or work.',
    group: 'combos',
  },
  {
    id: 'c5',
    name: 'Peanut Butter Banana Toast',
    portion: '3 Whole Wheat Bread + 2 tbsp Peanut Butter + 1 Sliced Banana + Honey',
    calories: 510,
    protein: 17,
    emoji: '🥪',
    note: 'Quick 3-minute evening snack for steady weight gain.',
    group: 'combos',
  },
  {
    id: 'c6',
    name: 'Eggs & Oats Breakfast Bowl',
    portion: '3 Whole Eggs + 60g Milk Oats + 1 Banana',
    calories: 590,
    protein: 29,
    emoji: '🍳',
    note: 'Complete amino acids + slow-release energy.',
    group: 'combos',
  },

  // DRY FRUITS & SEEDS
  { id: 'd1', name: 'Almonds (Badam)', portion: '20 pieces (28g)', calories: 165, protein: 6, emoji: '🌰', note: 'Healthy fats & Vitamin E.', group: 'dryfruits' },
  { id: 'd2', name: 'Roasted Peanuts', portion: '1 handful (40g)', calories: 230, protein: 10, emoji: '🥜', note: 'Highest protein budget nut.', group: 'dryfruits' },
  { id: 'd3', name: 'Cashews (Kaju)', portion: '15 pieces (28g)', calories: 157, protein: 5, emoji: '🫘', note: 'Creamy calorie booster.', group: 'dryfruits' },
  { id: 'd4', name: 'Dates (Khajoor)', portion: '4 soft dates', calories: 220, protein: 2, emoji: '🌴', note: 'Instant natural carbs & iron.', group: 'dryfruits' },
  { id: 'd5', name: 'Walnuts (Akhrot)', portion: '6 halves (28g)', calories: 185, protein: 4, emoji: '🧠', note: 'Omega-3 for brain & joints.', group: 'dryfruits' },
  { id: 'd6', name: 'Raisins (Kishmish)', portion: '2 tbsp (30g)', calories: 90, protein: 1, emoji: '🍇', note: 'Great with milk or oats.', group: 'dryfruits' },
  { id: 'd7', name: 'Pumpkin Seeds', portion: '2 tbsp (28g)', calories: 160, protein: 9, emoji: '🎃', note: 'Packed with zinc & protein.', group: 'dryfruits' },
  { id: 'd8', name: 'Pistachios (Pista)', portion: '30g', calories: 170, protein: 6, emoji: '🟢', note: 'Clean snacking protein.', group: 'dryfruits' },

  // FRUITS & SHAKES
  { id: 'f1', name: 'Banana', portion: '2 medium bananas', calories: 210, protein: 2.5, emoji: '🍌', note: 'Best pre/post workout fruit.', group: 'fruits' },
  { id: 'f2', name: 'Mango', portion: '1 large bowl (200g)', calories: 135, protein: 1.5, emoji: '🥭', note: 'Great in mango milkshakes.', group: 'fruits' },
  { id: 'f3', name: 'Avocado', portion: '1/2 medium', calories: 160, protein: 2, emoji: '🥑', note: 'Nutrient-dense healthy fats.', group: 'fruits' },
  { id: 'f4', name: 'Chickoo (Sapota)', portion: '2 medium', calories: 170, protein: 1, emoji: '🥝', note: 'High-calorie sweet fruit.', group: 'fruits' },
  { id: 'f5', name: 'Dates & Milk Shake', portion: '1 glass full-cream milk + 4 dates', calories: 370, protein: 10, emoji: '🥛', note: 'Drink before bed for gain.', group: 'fruits' },
  { id: 'f6', name: 'Apple + Peanut Butter', portion: '1 apple + 1.5 tbsp PB', calories: 240, protein: 6, emoji: '🍎', note: 'Crunchy energy snack.', group: 'fruits' },

  // DAILY FOODS
  { id: 'm1', name: 'Paneer (Cottage Cheese)', portion: '100g', calories: 265, protein: 18, emoji: '🧀', note: 'Slow-digesting casein protein.', group: 'foods' },
  { id: 'm2', name: 'Soya Chunks', portion: '50g dry', calories: 172, protein: 26, emoji: '🍲', note: 'Highest veg protein per gram.', group: 'foods' },
  { id: 'm3', name: 'Boiled Eggs', portion: '2 whole eggs', calories: 155, protein: 13, emoji: '🥚', note: 'Gold-standard protein.', group: 'foods' },
  { id: 'm4', name: 'Greek Yogurt / Hung Curd', portion: '150g bowl', calories: 145, protein: 14, emoji: '🥣', note: 'Gut-friendly protein.', group: 'foods' },
  { id: 'm5', name: 'Peanut Butter', portion: '2 tbsp (32g)', calories: 190, protein: 8, emoji: '🍯', note: 'Add to shakes, oats or toast.', group: 'foods' },
  { id: 'm6', name: 'Moong Dal / Chana', portion: '1 large cooked bowl', calories: 220, protein: 14, emoji: '🍛', note: 'Pair with rice for full protein.', group: 'foods' },
  { id: 'm7', name: 'Full-Cream Milk', portion: '1 tall glass (300ml)', calories: 195, protein: 10, emoji: '🥛', note: 'Calcium + easy liquid calories.', group: 'foods' },
  { id: 'm8', name: 'Chicken Breast', portion: '100g cooked', calories: 165, protein: 31, emoji: '🍗', note: 'Leanest pure protein source.', group: 'foods' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NutritionGainModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<'combos' | 'dryfruits' | 'fruits' | 'foods'>('combos');
  const [added, setAdded] = useState<FoodItem[]>([]);

  if (!open) return null;

  const totalCal = added.reduce((sum, item) => sum + item.calories, 0);
  const totalProt = added.reduce((sum, item) => sum + item.protein, 0);
  const items = FOOD_LIST.filter((f) => f.group === tab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="matte-box relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-pink-400" />
            <h2 className="text-lg font-extrabold text-white">Calories &amp; Protein Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 p-1.5 text-slate-300 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Plate Summary */}
        <div className="matte-box-soft mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3.5">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Your Plate</p>
              <p className="flex items-center gap-1 text-base font-extrabold text-amber-400">
                <Flame className="h-4 w-4" /> {totalCal} kcal
              </p>
            </div>
            <div className="h-7 w-px bg-white/10" />
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Total Protein</p>
              <p className="text-base font-extrabold text-pink-400">{totalProt.toFixed(1)} g</p>
            </div>
          </div>

          <button
            onClick={() => setAdded([])}
            className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/20"
          >
            <RotateCcw className="h-3 w-3" /> Clear ({added.length})
          </button>
        </div>

        {/* Category Tabs */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { id: 'combos', label: '🔥 Best Combos' },
            { id: 'dryfruits', label: '🥜 Dry Fruits' },
            { id: 'fruits', label: '🍌 Fruits & Shakes' },
            { id: 'foods', label: '🧀 Daily Foods' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'combos' | 'dryfruits' | 'fruits' | 'foods')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                tab === t.id
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                  : 'matte-box-soft text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Food Cards */}
        <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="matte-box-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3.5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">
                  {item.emoji}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">{item.name}</h3>
                  <p className="text-[11px] font-semibold text-sky-400">{item.portion}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{item.note}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-extrabold text-amber-400">{item.calories} kcal</p>
                  <p className="text-[11px] font-bold text-pink-400">{item.protein}g protein</p>
                </div>
                <button
                  onClick={() => setAdded((prev) => [...prev, item])}
                  className="flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}