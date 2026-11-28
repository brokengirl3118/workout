'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Dumbbell,
  ShieldCheck,
  X,
  PlayCircle,
  HeartPulse,
  Home,
  Info,
  ArrowRight,
  ArrowLeft,
  Zap,
  Droplets,
  Flame,
  Star,
  Baby,
  Smile,
  Award,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Play,
  Layers,
  Trophy,
  Heart,
  Shuffle,
  Wind,
  Plus,
  Minus,
  Moon,
  Sun,
  Utensils,
  User,
} from 'lucide-react';
import { supabase, Exercise } from '@/lib/supabase';
import { AGE_GROUPS, LevelKey } from '@/lib/data';
import {
  BODY_PART_CATEGORIES,
  TARGET_GOALS,
  TIME_OF_DAY_OPTIONS,
  matchesBodyPart,
  matchesTargetGoal,
  matchesTimeOfDay,
} from '@/lib/exerciseFilters';
import {
  WELLNESS_TOOLS,
  TOOL_CATEGORIES,
  ToolCategory,
  WellnessTool,
} from '@/lib/wellnessToolsData';
import { EXTRA_UNIQUE_FEATURES } from '@/lib/extraUniqueFeatures';
import LevelGuideModal from '@/components/LevelGuideModal';
import BloomCoach from '@/components/BloomCoach';
import ExerciseAnimator from '@/components/ExerciseAnimator';
import MaintainerView from '@/components/MaintainerView';
import GuidedExercisePlayer from '@/components/GuidedExercisePlayer';
import WellnessStudioHub, { InteractiveToolModal } from '@/components/WellnessStudioHub';
import WelcomeSplash from '@/components/WelcomeSplash';
import NutritionGainModal from '@/components/NutritionGainModal';
import StepReveal from '@/components/StepReveal';
import {
  AuthModal,
  NotificationBell,
  AlertEntry,
  ChatMsg,
  ActivityEntry,
  loadCloudProgress,
  saveCloudProgress,
  signOutGoogle,
} from '@/components/AccountAndAlerts';

type NavTab = 'home' | 'maintainer' | 'exercises' | 'tools' | 'about';
type ExerciseStep = 1 | 2 | 3;
type MoodKey = 'energetic' | 'tired' | 'stressed' | 'sore';

const SHORT_CAT_NAMES: Record<ToolCategory, string> = {
  All: 'All',
  'Strength & Gym': 'Strength',
  'Timers & Breath': 'Timers',
  'Body Metrics': 'Metrics',
  'Nutrition & Water': 'Nutrition',
  'Cardio & Heart': 'Cardio',
  'Posture & Mobility': 'Mobility',
  'Sleep & Recovery': 'Sleep',
  'Habits & Family': 'Habits',
};

const MOOD_PRESETS: Record<
  MoodKey,
  { label: string; emoji: string; tip: string; actionLabel: string; toolId: number }
> = {
  energetic: {
    label: 'Energetic',
    emoji: '⚡',
    tip: 'Channel that energy into a 4-minute Tabata blast.',
    actionLabel: 'Start Tabata',
    toolId: 16,
  },
  tired: {
    label: 'Low Energy',
    emoji: '🔋',
    tip: 'Take 1 glass of water + a 5-minute spine wake-up.',
    actionLabel: 'Spine Wake-Up',
    toolId: 74,
  },
  stressed: {
    label: 'Stressed',
    emoji: '🌿',
    tip: 'Reset your heart rate with 4-4-4-4 Box Breathing.',
    actionLabel: 'Breathe Now',
    toolId: 18,
  },
  sore: {
    label: 'Sore',
    emoji: '🧊',
    tip: 'Follow the gentle DOMS relief flow to recover faster.',
    actionLabel: 'Recovery Flow',
    toolId: 85,
  },
};

export default function HomePage() {
  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [exerciseStep, setExerciseStep] = useState<ExerciseStep>(1);
  const [toolCategory, setToolCategory] = useState<ToolCategory>('All');
  const [quickTool, setQuickTool] = useState<WellnessTool | null>(null);
  const [xp, setXp] = useState<number>(0);

  // Google Auth & Permanent Cloud Sync State
  const [authUser, setAuthUser] = useState<{
    id: string;
    email: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [coachGender, setCoachGender] = useState<'male' | 'female' | null>('female');
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([
    {
      role: 'model',
      text: '🌸 Hi! Sign in with Google to save all our chats and your daily progress permanently.',
    },
  ]);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);

  const [alerts, setAlerts] = useState<AlertEntry[]>([
    {
      id: 'init-1',
      title: 'Welcome to 🌸',
      detail: 'Sign in with Google to save every activity, XP, water log, and AI chat permanently.',
      time: 'Now',
      read: false,
    },
  ]);

  // Theme & Nutrition Guide State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [nutritionOpen, setNutritionOpen] = useState(false);

  // Daily Home Features State
  const [streak, setStreak] = useState<number>(1);
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [waterGlasses, setWaterGlasses] = useState<number>(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [breathOn, setBreathOn] = useState<boolean>(false);
  const [breathTick, setBreathTick] = useState<number>(0);

  // Exercises State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('all');

  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [guideLevel, setGuideLevel] = useState<LevelKey | null>(null);

  const pushAlert = (title: string, detail: string) => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    setAlerts((prev) => [
      { id: `${Date.now()}-${Math.random()}`, title, detail, time: nowTime, read: false },
      ...prev.slice(0, 39),
    ]);
  };

  const logActivity = (action: string, detail: string) => {
    setActivityLog((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        action,
        detail,
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, 149),
    ]);
  };

  // Subscribe to Google Auth & Load Permanent Cloud Progress
  useEffect(() => {
    document.title = '🌸';

    const hydrateGuest = () => {
      const savedTheme = localStorage.getItem('flower_theme') as 'dark' | 'light' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }

      const savedXp = localStorage.getItem('fitlife_xp');
      if (savedXp) setXp(Number(savedXp));

      const savedWater = localStorage.getItem('fitlife_water');
      if (savedWater) setWaterGlasses(Number(savedWater));

      const savedFavs = localStorage.getItem('fitlife_favorites');
      if (savedFavs) {
        try {
          setFavoriteIds(JSON.parse(savedFavs));
        } catch {
          setFavoriteIds([]);
        }
      }

      const savedChat = localStorage.getItem('flower_guest_chat');
      if (savedChat) {
        try {
          setChatHistory(JSON.parse(savedChat));
        } catch {}
      }

      const today = new Date().toISOString().slice(0, 10);
      const lastVisit = localStorage.getItem('fitlife_last_visit');
      const savedStreak = Number(localStorage.getItem('fitlife_streak') || '0');

      if (!lastVisit) {
        setStreak(1);
        localStorage.setItem('fitlife_streak', '1');
        localStorage.setItem('fitlife_last_visit', today);
      } else if (lastVisit === today) {
        setStreak(Math.max(1, savedStreak));
      } else {
        const prev = new Date(lastVisit);
        const now = new Date(today);
        const diffDays = Math.round(
          (now.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        );
        const nextStreak = diffDays === 1 ? savedStreak + 1 : 1;
        setStreak(nextStreak);
        localStorage.setItem('fitlife_streak', String(nextStreak));
        localStorage.setItem('fitlife_last_visit', today);
      }
    };

    const hydrateUser = async (supaUser: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    } | null) => {
      if (!supaUser) {
        setAuthUser(null);
        hydrateGuest();
        return;
      }

      const cloud = await loadCloudProgress(supaUser);
      setAuthUser({
        id: supaUser.id,
        email: cloud.email,
        name: cloud.full_name,
        avatar: cloud.avatar_url,
      });
      setXp(cloud.xp);
      setStreak(cloud.streak);
      setWaterGlasses(cloud.water);
      setFavoriteIds(cloud.favorites);
      setTheme(cloud.theme);
      setCoachGender(cloud.coach_gender);
      setAlerts(cloud.alerts);
      setChatHistory(cloud.chat_history);
      setActivityLog(cloud.activity_log);
      document.documentElement.setAttribute('data-theme', cloud.theme);
    };

    supabase.auth.getUser().then(({ data }) => hydrateUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Auto-save every activity, progress field & AI chat permanently to Supabase
  useEffect(() => {
    if (!authUser) {
      localStorage.setItem('flower_guest_chat', JSON.stringify(chatHistory.slice(-50)));
      return;
    }

    const timer = setTimeout(async () => {
      setSyncingCloud(true);
      await saveCloudProgress({
        user_id: authUser.id,
        email: authUser.email,
        full_name: authUser.name,
        avatar_url: authUser.avatar || '',
        xp,
        streak,
        last_visit: new Date().toISOString().slice(0, 10),
        water: waterGlasses,
        favorites: favoriteIds,
        theme,
        coach_gender: coachGender || 'female',
        alerts,
        chat_history: chatHistory,
        activity_log: activityLog,
      });
      setSyncingCloud(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [
    authUser,
    xp,
    streak,
    waterGlasses,
    favoriteIds,
    theme,
    coachGender,
    alerts,
    chatHistory,
    activityLog,
  ]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('flower_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    pushAlert('Theme Switched', `Switched to ${next === 'dark' ? 'Dark' : 'Light'} mode.`);
    logActivity('Theme Switched', `Changed to ${next} mode`);
  };

  useEffect(() => {
    if (!breathOn) return;
    const t = setInterval(() => {
      setBreathTick((prev) => (prev + 1) % 12);
    }, 1000);
    return () => clearInterval(t);
  }, [breathOn]);

  const earnXp = (pts: number, title?: string) => {
    setXp((prev) => {
      const next = prev + pts;
      localStorage.setItem('fitlife_xp', String(next));
      pushAlert('XP Earned', `${title ? `${title}: ` : ''}+${pts} XP (Total: ${next} XP)`);
      logActivity('XP Earned', `${title ? `${title} ` : ''}+${pts} XP`);
      return next;
    });
  };

  const updateWater = (nextVal: number) => {
    const clamped = Math.max(0, Math.min(16, nextVal));
    setWaterGlasses(clamped);
    localStorage.setItem('fitlife_water', String(clamped));
    if (clamped > waterGlasses) {
      earnXp(5, 'Hydration');
      pushAlert('Water Logged', `Glass #${clamped} (${(clamped * 0.25).toFixed(2)} L)`);
      logActivity('Water Logged', `Glass #${clamped}`);
    }
  };

  const toggleFavorite = (id: string, name?: string) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((x) => x !== id) : [id, ...prev];
      localStorage.setItem('fitlife_favorites', JSON.stringify(updated));
      pushAlert(
        exists ? 'Removed Favorite' : 'Saved Favorite',
        name
          ? `${name} ${exists ? 'removed from' : 'added to'} Saved Moves.`
          : 'Updated Saved Moves.'
      );
      logActivity(
        exists ? 'Removed Favorite' : 'Saved Favorite',
        name || id
      );
      return updated;
    });
  };

  const spinRandomExercise = () => {
    if (exercises.length === 0) return;
    const pick = exercises[Math.floor(Math.random() * exercises.length)];
    setActiveExercise(pick);
    setIsGuidedMode(false);
    pushAlert('Random Pick', `Selected ${pick.name}`);
    logActivity('Random Exercise', pick.name);
  };

  useEffect(() => {
    const fetchAllExercises = async () => {
      let allRows: Exercise[] = [];
      let from = 0;
      const batchSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name')
          .range(from, from + batchSize - 1);

        if (error) {
          setDbError(error.message);
          break;
        }
        if (!data || data.length === 0) break;
        allRows = [...allRows, ...(data as Exercise[])];
        if (data.length < batchSize) break;
        from += batchSize;
      }

      setExercises(allRows);
      setLoading(false);
    };
    fetchAllExercises();
  }, []);

  const activeBodyGroup = BODY_PART_CATEGORIES.find((b) => b.id === selectedBodyPart);
  const activeGoalObj = TARGET_GOALS.find((g) => g.id === selectedGoal);
  const activeTimeObj = TIME_OF_DAY_OPTIONS.find((t) => t.id === selectedTime);

  const homeExtras = useMemo(
    () => EXTRA_UNIQUE_FEATURES.filter((f) => f.section === 'home'),
    []
  );
  const exerciseExtras = useMemo(
    () => EXTRA_UNIQUE_FEATURES.filter((f) => f.section === 'exercises'),
    []
  );
  const aboutExtras = useMemo(
    () => EXTRA_UNIQUE_FEATURES.filter((f) => f.section === 'about'),
    []
  );

  const favoriteExercises = useMemo(
    () => exercises.filter((ex) => favoriteIds.includes(ex.id)).slice(0, 6),
    [exercises, favoriteIds]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (q) {
        const matchText =
          ex.name.toLowerCase().includes(q) ||
          ex.muscle_group.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q) ||
          ex.category.toLowerCase().includes(q);
        if (!matchText) return false;
      } else if (selectedAge !== 'all') {
        if (!ex.age_groups.includes(selectedAge)) return false;
      }

      if (selectedGender !== 'All') {
        if (ex.gender_focus !== 'Unisex' && ex.gender_focus !== selectedGender) return false;
      }

      if (!matchesBodyPart(ex, selectedBodyPart, selectedMuscle)) return false;
      if (!matchesTargetGoal(ex, selectedGoal)) return false;
      if (!matchesTimeOfDay(ex, selectedTime)) return false;

      return true;
    });
  }, [
    exercises,
    search,
    selectedAge,
    selectedGender,
    selectedBodyPart,
    selectedMuscle,
    selectedGoal,
    selectedTime,
  ]);

  const visibleExercises = filtered.slice(0, visibleCount);

  const openExercisesWizard = () => {
    setActiveNav('exercises');
    setExerciseStep(1);
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedAge('all');
    setSelectedGender('All');
    setSelectedBodyPart('all');
    setSelectedMuscle('all');
    setSelectedGoal('all');
    setSelectedTime('all');
    setVisibleCount(24);
    setExerciseStep(1);
  };

  const jumpToAge = (ageId: string) => {
    setSearch('');
    setSelectedAge(ageId);
    setSelectedBodyPart('all');
    setSelectedMuscle('all');
    setVisibleCount(24);
    setActiveNav('exercises');
    setExerciseStep(1);
    logActivity('Age Group Selected', ageId);
  };

  const featuredQuickTools = useMemo(
    () =>
      [1, 16, 17, 18, 28, 35, 36, 42, 43, 58, 69, 92]
        .map((id) => WELLNESS_TOOLS.find((t) => t.id === id))
        .filter(Boolean) as WellnessTool[],
    []
  );

  const breathPhase =
    !breathOn
      ? 'Tap to Relax'
      : breathTick < 4
      ? 'Inhale...'
      : breathTick < 8
      ? 'Hold...'
      : 'Exhale...';

  const fieldClass =
    'rounded-xl border border-sky-500/25 bg-[var(--bg-input)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-sky-400';

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <WelcomeSplash />

      {/* STICKY NAVIGATION BAR WITH PANE BORDERS */}
      <nav className="nav-pane sticky top-0 z-40 bg-[var(--bg-nav)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setActiveNav('home')}
            title="Home"
            className="matte-pill flex h-10 w-10 items-center justify-center rounded-2xl text-2xl transition hover:scale-110"
          >
            🌸
          </button>

          <div className="nav-pane-group flex flex-wrap items-center gap-1.5">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'maintainer', label: 'Maintainer', icon: HeartPulse },
              { id: 'exercises', label: 'Exercises', icon: Dumbbell },
              { id: 'tools', label: 'Tools', icon: Layers },
              { id: 'about', label: 'About', icon: Info },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'exercises') {
                      openExercisesWizard();
                    } else if (item.id === 'tools') {
                      setToolCategory('All');
                      setActiveNav('tools');
                    } else {
                      setActiveNav(item.id as NavTab);
                    }
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'matte-pill text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:bg-sky-500/10 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-sky-400" />
                  {item.label}
                </button>
              );
            })}

            <NotificationBell
              alerts={alerts}
              onMarkAllRead={() =>
                setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
              }
              onClearAll={() => setAlerts([])}
            />

            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="matte-pill flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-sky-400 transition hover:scale-105"
            >
              {authUser?.avatar ? (
                <img
                  src={authUser.avatar}
                  alt={authUser.name}
                  className="h-4 w-4 rounded-full object-cover"
                />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
              {authUser ? authUser.name : 'Google Login'}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title="Switch Light / Dark Theme"
              className="matte-pill flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 transition hover:scale-105"
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
              )}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================
          PAGE 1: HOME
         ========================================================= */}
      {activeNav === 'home' && (
        <div className="animate-step-open mx-auto max-w-5xl space-y-7 px-4 py-7">
          {/* 1. AGE GROUPS AT TOP */}
          <StepReveal className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Age Groups</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-3 py-1 text-[11px] font-bold text-orange-400">
                  <Flame className="h-3.5 w-3.5" /> {streak} Day Streak
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-400">
                  <Trophy className="h-3.5 w-3.5" /> {xp} XP
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  id: '0-2',
                  title: 'Kids',
                  ages: '0 – 12 yrs',
                  desc: 'Playful balance & motor drills.',
                  icon: Baby,
                  badge: 'bg-cyan-500/20 text-cyan-400',
                },
                {
                  id: '13-17',
                  title: 'Teens',
                  ages: '13 – 17 yrs',
                  desc: 'Agility, posture & core strength.',
                  icon: Zap,
                  badge: 'bg-indigo-500/20 text-indigo-400',
                },
                {
                  id: '18-39',
                  title: 'Adults',
                  ages: '18 – 59 yrs',
                  desc: 'Gym, dumbbells & cardio mastery.',
                  icon: Award,
                  badge: 'bg-pink-500/20 text-pink-400',
                },
                {
                  id: '60-74',
                  title: 'Seniors',
                  ages: '60 – 90 yrs',
                  desc: 'Chair mobility & joint care.',
                  icon: Smile,
                  badge: 'bg-emerald-500/20 text-emerald-400',
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => jumpToAge(card.id)}
                    className="matte-box group cursor-pointer rounded-2xl p-4 transition hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${card.badge}`}
                      >
                        {card.ages}
                      </span>
                      <Icon className="h-4 w-4 text-[var(--text-muted)] group-hover:text-sky-400" />
                    </div>
                    <h3 className="mt-3 text-base font-extrabold text-[var(--text-primary)]">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </StepReveal>

          {/* 2. DAILY ESSENTIALS */}
          <StepReveal delayMs={60} className="grid gap-3.5 md:grid-cols-3">
            <div className="matte-box-soft flex flex-col justify-between rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-sky-400">
                  <Droplets className="h-4 w-4" /> Water Today
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {waterGlasses} / 8
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sky-500/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}
                />
              </div>
              <div className="mt-3.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {(waterGlasses * 0.25).toFixed(2)} L drank
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateWater(waterGlasses - 1)}
                    className={`${fieldClass} p-1.5`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateWater(waterGlasses + 1)}
                    className="flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-sky-400"
                  >
                    <Plus className="h-3 w-3" /> Glass
                  </button>
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                setBreathOn((v) => !v);
                setBreathTick(0);
              }}
              className="matte-box-soft flex cursor-pointer items-center justify-between rounded-2xl p-4 transition hover:-translate-y-0.5"
            >
              <div>
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-400">
                  <Wind className="h-4 w-4" /> Calm Breath
                </span>
                <p className="mt-2 text-lg font-extrabold text-[var(--text-primary)]">
                  {breathPhase}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {breathOn ? 'Tap to stop' : '4-4-4 instant reset'}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-indigo-400/50 bg-indigo-500/20 text-indigo-400 transition-transform duration-1000 ${
                  breathOn && breathTick < 8 ? 'scale-110 bg-sky-500/30' : 'scale-90'
                }`}
              >
                <Wind className="h-5 w-5" />
              </div>
            </div>

            <div className="matte-box-soft flex flex-col justify-between rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-extrabold text-pink-400">
                  <Shuffle className="h-4 w-4" /> Quick Pick
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">Random Move</span>
              </div>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Not sure what to do? Spin a surprise exercise right now.
              </p>
              <button
                type="button"
                onClick={spinRandomExercise}
                disabled={loading || exercises.length === 0}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                <Shuffle className="h-3.5 w-3.5" /> Spin Exercise
              </button>
            </div>
          </StepReveal>

          {/* 3. MOOD CHECK-IN */}
          <StepReveal delayMs={100} className="matte-box-soft rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-extrabold text-[var(--text-primary)]">
                How do you feel right now?
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(MOOD_PRESETS) as MoodKey[]).map((key) => {
                  const m = MOOD_PRESETS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMood(key);
                        pushAlert('Mood Logged', `Feeling ${m.label.toLowerCase()} today.`);
                        logActivity('Mood Checked', m.label);
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        mood === key
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                          : 'border border-sky-500/20 bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-sky-400'
                      }`}
                    >
                      {m.emoji} {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {mood && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-sky-500/15 pt-3">
                <p className="text-xs text-sky-400">{MOOD_PRESETS[mood].tip}</p>
                <button
                  type="button"
                  onClick={() => {
                    const target = WELLNESS_TOOLS.find(
                      (t) => t.id === MOOD_PRESETS[mood].toolId
                    );
                    if (target) {
                      setQuickTool(target);
                      logActivity('Tool Opened', target.title);
                    }
                  }}
                  className="rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/30"
                >
                  {MOOD_PRESETS[mood].actionLabel} →
                </button>
              </div>
            )}
          </StepReveal>

          {/* 4. SAVED FAVORITES */}
          {favoriteExercises.length > 0 && (
            <StepReveal className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-lg font-extrabold text-[var(--text-primary)]">
                  <Heart className="h-4 w-4 fill-pink-500 text-pink-500" /> Saved Moves
                </h3>
                <button
                  type="button"
                  onClick={openExercisesWizard}
                  className="text-xs font-bold text-pink-400 hover:underline"
                >
                  Add More →
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {favoriteExercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => {
                      setActiveExercise(ex);
                      setIsGuidedMode(false);
                    }}
                    className="matte-box-soft flex cursor-pointer items-center justify-between gap-2 rounded-2xl p-3.5 transition hover:-translate-y-0.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-[var(--text-primary)]">
                        {ex.name}
                      </p>
                      <p className="truncate text-[11px] text-sky-400">{ex.muscle_group}</p>
                    </div>
                    <PlayCircle className="h-5 w-5 shrink-0 text-pink-400" />
                  </div>
                ))}
              </div>
            </StepReveal>
          )}

          {/* 5. MAIN ACTION BANNER */}
          <StepReveal className="matte-box rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
                  Move Better.{' '}
                  <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                    Live Stronger.
                  </span>
                </h2>
                <p className="mt-1.5 max-w-md text-xs text-[var(--text-secondary)]">
                  Animated workouts, calories &amp; protein meal combos, timers, and 🥷 &amp; 🌸
                  coaches.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={openExercisesWizard}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:brightness-110"
                >
                  Exercises <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNutritionOpen(true);
                    logActivity('Nutrition Opened', 'Calories & Protein Guide');
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:brightness-110"
                >
                  <Utensils className="h-3.5 w-3.5" /> Gain Calories &amp; Protein
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav('maintainer')}
                  className="matte-pill flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-sky-400 hover:opacity-90"
                >
                  <HeartPulse className="h-3.5 w-3.5" /> Maintainer
                </button>
              </div>
            </div>
          </StepReveal>

          {/* 6. QUICK TOOLS GRID */}
          <StepReveal className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Quick Tools</h3>
              <button
                type="button"
                onClick={() => setActiveNav('tools')}
                className="text-xs font-bold text-sky-400 hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredQuickTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setQuickTool(tool);
                    logActivity('Tool Opened', tool.title);
                  }}
                  className="matte-box-soft group flex items-center gap-3 rounded-2xl p-3.5 text-left transition hover:-translate-y-0.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-base">
                    {tool.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-[var(--text-primary)] group-hover:text-sky-400">
                      {tool.title}
                    </p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">{tool.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          </StepReveal>

          {/* 7. TOOL CATEGORIES */}
          <StepReveal className="matte-box rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Categories</h3>
              <button
                type="button"
                onClick={() => setActiveNav('tools')}
                className="rounded-xl bg-sky-500/20 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/30"
              >
                Open Tools
              </button>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
              {TOOL_CATEGORIES.filter((c) => c.id !== 'All').map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setToolCategory(c.id);
                    setActiveNav('tools');
                  }}
                  className="matte-box-soft flex items-center gap-2.5 rounded-2xl p-3 text-left transition hover:-translate-y-0.5"
                >
                  <span className="text-xl">{c.emoji}</span>
                  <p className="text-xs font-extrabold text-[var(--text-primary)]">
                    {SHORT_CAT_NAMES[c.id]}
                  </p>
                </button>
              ))}
            </div>
          </StepReveal>

          {/* 8. LEVEL GUIDES */}
          <StepReveal className="matte-box rounded-3xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <Star className="h-3.5 w-3.5" /> Level Plans
                </span>
                <h3 className="mt-0.5 text-lg font-extrabold text-[var(--text-primary)]">
                  Training Guides
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as LevelKey[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setGuideLevel(lvl);
                      logActivity('Guide Opened', `${lvl} Guide`);
                    }}
                    className="matte-pill flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:opacity-90"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </StepReveal>

          {/* 9. UNIQUE HOME DAILY EXTRAS (IDs 100 - 120) */}
          <StepReveal className="space-y-3">
            <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Daily Extras</h3>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {homeExtras.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setQuickTool(item);
                    logActivity('Extra Opened', item.title);
                  }}
                  className="matte-box-soft flex items-center gap-2.5 rounded-2xl p-3 text-left transition hover:-translate-y-0.5"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="truncate text-[10px] text-[var(--text-muted)]">{item.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          </StepReveal>
        </div>
      )}

      {/* =========================================================
          PAGE 2: MAINTAINER
         ========================================================= */}
      {activeNav === 'maintainer' && (
        <div className="animate-step-open">
          <MaintainerView />
        </div>
      )}

      {/* =========================================================
          PAGE 3: EXERCISES WIZARD
         ========================================================= */}
      {activeNav === 'exercises' && (
        <section className="animate-step-open mx-auto max-w-5xl space-y-8 px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { step: 1 as ExerciseStep, label: '1. Body Part' },
              { step: 2 as ExerciseStep, label: '2. Goal & Time' },
              { step: 3 as ExerciseStep, label: '3. Workouts' },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setExerciseStep(s.step)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  exerciseStep === s.step
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                    : 'matte-box-soft text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {exerciseStep === 1 && (
            <div className="animate-step-open matte-box mx-auto max-w-3xl rounded-3xl p-6">
              <h2 className="text-center text-2xl font-extrabold text-[var(--text-primary)]">
                Select Body Part
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {BODY_PART_CATEGORIES.map((bp) => {
                  const isSelected = selectedBodyPart === bp.id;
                  return (
                    <button
                      key={bp.id}
                      type="button"
                      onClick={() => {
                        setSelectedBodyPart(bp.id);
                        setSelectedMuscle('all');
                        if (bp.muscles.length <= 1) {
                          setExerciseStep(2);
                        }
                      }}
                      className={`flex flex-col items-center rounded-2xl p-4 text-center transition hover:-translate-y-0.5 ${
                        isSelected
                          ? 'matte-box text-[var(--text-primary)]'
                          : 'matte-box-soft text-[var(--text-secondary)]'
                      }`}
                    >
                      <span className="text-2xl">{bp.emoji}</span>
                      <span className="mt-2 text-xs font-extrabold">{bp.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeBodyGroup && activeBodyGroup.muscles.length > 1 && (
                <div className="animate-step-open matte-box-soft mt-6 rounded-2xl p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                    {activeBodyGroup.label} Muscles (A–Z)
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMuscle('all');
                        setExerciseStep(2);
                      }}
                      className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      All {activeBodyGroup.label} →
                    </button>
                    {activeBodyGroup.muscles.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setSelectedMuscle(m);
                          setExerciseStep(2);
                        }}
                        className={`${fieldClass} hover:border-sky-400`}
                      >
                        {m} →
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setExerciseStep(2)}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-xs font-bold text-white"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {exerciseStep === 2 && (
            <div className="animate-step-open matte-box mx-auto max-w-3xl rounded-3xl p-6">
              <h2 className="text-center text-2xl font-extrabold text-[var(--text-primary)]">
                Goal &amp; Time
              </h2>

              <div className="mt-6">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-pink-400">
                  Target Goal
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {TARGET_GOALS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGoal(g.id)}
                      className={`rounded-2xl p-3.5 text-left transition ${
                        selectedGoal === g.id
                          ? 'matte-box text-[var(--text-primary)]'
                          : 'matte-box-soft text-[var(--text-secondary)]'
                      }`}
                    >
                      <p className="text-xs font-extrabold">{g.label}</p>
                      {g.tip && (
                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">{g.tip}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Time of Day
                </p>
                <div className="grid gap-2.5 sm:grid-cols-5">
                  {TIME_OF_DAY_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTime(t.id)}
                      className={`flex flex-col items-center rounded-2xl p-3 text-center transition ${
                        selectedTime === t.id
                          ? 'matte-box text-[var(--text-primary)]'
                          : 'matte-box-soft text-[var(--text-secondary)]'
                      }`}
                    >
                      <span className="text-lg">{t.emoji}</span>
                      <span className="mt-1 text-xs font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExerciseStep(1)}
                  className="matte-box-soft flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVisibleCount(24);
                    setExerciseStep(3);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-xs font-bold text-white"
                >
                  Show Workouts <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {exerciseStep === 3 && (
            <div className="animate-step-open">
              <div className="matte-box rounded-3xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setExerciseStep(2)}
                      className="matte-box-soft flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)]"
                    >
                      <ArrowLeft className="h-3 w-3" /> Back
                    </button>
                    <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-400">
                      {activeBodyGroup?.emoji} {activeBodyGroup?.label}
                      {selectedMuscle !== 'all' ? `: ${selectedMuscle}` : ''}
                    </span>
                    <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-400">
                      {activeGoalObj?.label}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                      {activeTimeObj?.emoji} {activeTimeObj?.label}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="flex items-center gap-1 rounded-xl bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/30"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                  <div className="relative min-w-[220px] flex-1">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-sky-400" />
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setVisibleCount(24);
                      }}
                      placeholder="Search exercises..."
                      className="w-full rounded-xl border border-sky-500/25 bg-[var(--bg-input)] py-2 pl-9 pr-3 text-xs font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-sky-400"
                    />
                  </div>

                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className={fieldClass}
                  >
                    {AGE_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-1 rounded-xl border border-sky-500/25 bg-[var(--bg-input)] p-1">
                    {['All', 'Male', 'Female'].map((gen) => (
                      <button
                        key={gen}
                        type="button"
                        onClick={() => setSelectedGender(gen)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          selectedGender === gen
                            ? 'bg-sky-500 text-white'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? (
                <p className="mt-10 text-center text-xs font-bold text-sky-400">Loading...</p>
              ) : dbError ? (
                <p className="mt-10 text-center text-xs font-bold text-rose-400">{dbError}</p>
              ) : filtered.length === 0 ? (
                <div className="mt-10 text-center">
                  <p className="text-xs font-bold text-[var(--text-muted)]">No matches found.</p>
                  <button
                    type="button"
                    onClick={() => setExerciseStep(2)}
                    className="mt-3 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white"
                  >
                    Change Goal or Time
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleExercises.map((ex, idx) => {
                      const isFav = favoriteIds.includes(ex.id);
                      return (
                        <StepReveal key={ex.id} delayMs={Math.min(idx * 25, 250)}>
                          <div
                            onClick={() => {
                              setActiveExercise(ex);
                              setIsGuidedMode(false);
                              logActivity('Exercise Viewed', ex.name);
                            }}
                            className="matte-box-soft group relative cursor-pointer overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-1"
                          >
                            <div className="relative h-44 w-full overflow-hidden bg-black">
                              {ex.media_url && (
                                <img
                                  src={ex.media_url}
                                  alt={ex.name}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(ex.id, ex.name);
                                }}
                                title="Save Favorite"
                                className="absolute left-2.5 top-2.5 rounded-full bg-black/75 p-1.5 backdrop-blur transition hover:scale-110"
                              >
                                <Heart
                                  className={`h-3.5 w-3.5 ${
                                    isFav ? 'fill-pink-500 text-pink-500' : 'text-slate-300'
                                  }`}
                                />
                              </button>
                              <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-bold text-sky-300 backdrop-blur">
                                <PlayCircle className="h-3 w-3" /> Live Form
                              </div>
                            </div>
                            <div className="p-3.5">
                              <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-sky-400">
                                  {ex.level}
                                </span>
                                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-indigo-400">
                                  {ex.muscle_group}
                                </span>
                                <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-pink-400">
                                  {ex.equipment}
                                </span>
                              </div>
                              <h3 className="mt-2 text-base font-extrabold text-[var(--text-primary)] group-hover:text-sky-400">
                                {ex.name}
                              </h3>
                              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                                {ex.sets_reps}
                              </p>
                            </div>
                          </div>
                        </StepReveal>
                      );
                    })}
                  </div>

                  {visibleCount < filtered.length && (
                    <div className="mt-8 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + 24)}
                        className="matte-pill rounded-xl px-6 py-2.5 text-xs font-bold text-sky-400 hover:opacity-90"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <StepReveal className="space-y-3 pt-4">
            <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Workout Boosters</h3>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {exerciseExtras.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setQuickTool(item);
                    logActivity('Booster Opened', item.title);
                  }}
                  className="matte-box-soft flex items-center gap-2.5 rounded-2xl p-3 text-left transition hover:-translate-y-0.5"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="truncate text-[10px] text-[var(--text-muted)]">{item.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          </StepReveal>
        </section>
      )}

      {/* =========================================================
          PAGE 4: HEALTH TOOLS
         ========================================================= */}
      {activeNav === 'tools' && (
        <div className="animate-step-open">
          <WellnessStudioHub
            xp={xp}
            onEarnXp={earnXp}
            initialCategory={toolCategory}
          />
        </div>
      )}

      {/* =========================================================
          PAGE 5: ABOUT
         ========================================================= */}
      {activeNav === 'about' && (
        <section className="animate-step-open mx-auto max-w-4xl space-y-8 px-4 py-10">
          <div className="matte-box relative flex min-h-[55vh] w-full flex-col items-center justify-center overflow-hidden rounded-3xl px-8 py-16 text-center shadow-2xl shadow-pink-500/10">
            <span className="animate-float-up pointer-events-none absolute left-[18%] top-2/3 text-lg opacity-60">
              🌸
            </span>
            <span className="animate-float-up pointer-events-none absolute right-[20%] top-3/4 text-base opacity-60 [animation-delay:1.1s]">
              💖
            </span>
            <span className="animate-float-up pointer-events-none absolute left-[48%] top-3/4 text-sm opacity-60 [animation-delay:2.1s]">
              🌷
            </span>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/15 shadow-lg shadow-pink-500/20">
              <Heart className="animate-heartbeat h-8 w-8 fill-pink-500 text-pink-400" />
            </div>

            <h2 className="animate-shimmer-text mt-6 bg-gradient-to-r from-pink-400 via-sky-400 to-rose-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              Created for my Hubie with Love.
            </h2>
          </div>

          <StepReveal className="space-y-3">
            <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Love Notes</h3>
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {aboutExtras.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQuickTool(item)}
                  className="matte-box-soft flex items-center gap-2.5 rounded-2xl p-3 text-left transition hover:-translate-y-0.5"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="truncate text-[10px] text-[var(--text-muted)]">{item.tagline}</p>
                  </div>
                </button>
              ))}
            </div>
          </StepReveal>
        </section>
      )}

      {/* Exercise Modal */}
      {activeExercise && (
        <div
          onClick={() => {
            setActiveExercise(null);
            setIsGuidedMode(false);
          }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="matte-box relative z-[121] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-5 shadow-2xl"
          >
            <div className="absolute right-4 top-4 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleFavorite(activeExercise.id, activeExercise.name)}
                title="Save Favorite"
                className="rounded-xl bg-sky-500/15 p-1.5 hover:bg-sky-500/25"
              >
                <Heart
                  className={`h-4 w-4 ${
                    favoriteIds.includes(activeExercise.id)
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-[var(--text-muted)]'
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveExercise(null);
                  setIsGuidedMode(false);
                }}
                className="rounded-xl bg-sky-500/15 p-1.5 text-[var(--text-primary)] hover:bg-sky-500/25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 className="pr-16 text-lg font-extrabold text-[var(--text-primary)]">
              {activeExercise.name}
            </h2>
            <p className="mt-0.5 text-xs font-bold text-sky-400">
              {activeExercise.muscle_group} • {activeExercise.equipment} • {activeExercise.sets_reps}
            </p>

            {isGuidedMode ? (
              <div className="mt-4">
                <GuidedExercisePlayer
                  exercise={activeExercise}
                  onExit={() => {
                    setIsGuidedMode(false);
                    earnXp(50, activeExercise.name);
                  }}
                />
              </div>
            ) : (
              <>
                <ExerciseAnimator
                  name={activeExercise.name}
                  frame1={activeExercise.media_url}
                  frame2={activeExercise.media_url_2}
                />

                <button
                  type="button"
                  onClick={() => {
                    setIsGuidedMode(true);
                    pushAlert('Workout Started', `Started ${activeExercise.name}`);
                    logActivity('Workout Started', activeExercise.name);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 py-3 text-xs font-extrabold text-white shadow-md hover:brightness-110"
                >
                  <Play className="h-3.5 w-3.5 fill-white" /> Start Exercise
                </button>

                {activeExercise.long_description && (
                  <div className="matte-box-soft mt-4 rounded-2xl p-3.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                      Overview
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {activeExercise.long_description}
                    </p>
                  </div>
                )}

                {activeExercise.benefits && activeExercise.benefits.length > 0 && (
                  <div className="matte-box-soft mt-3 rounded-2xl p-3.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      Benefits
                    </h3>
                    <ul className="mt-1.5 space-y-1 text-xs text-[var(--text-secondary)]">
                      {activeExercise.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeExercise.results_timeline && (
                  <div className="matte-box-soft mt-3 rounded-2xl p-3.5">
                    <h3 className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-pink-400">
                      <Calendar className="h-3.5 w-3.5" /> Timeline
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {activeExercise.results_timeline}
                    </p>
                  </div>
                )}

                <h3 className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Steps
                </h3>
                <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs text-[var(--text-secondary)]">
                  {activeExercise.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                {activeExercise.safety_note && (
                  <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                    <strong>Safety:</strong> {activeExercise.safety_note}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <NutritionGainModal
        open={nutritionOpen}
        onClose={() => {
          setNutritionOpen(false);
          pushAlert('Nutrition Checked', 'Reviewed calories & protein combinations.');
        }}
      />

      <InteractiveToolModal
        tool={quickTool}
        onClose={() => setQuickTool(null)}
        onEarnXp={earnXp}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        user={authUser}
        syncing={syncingCloud}
        onLogout={async () => {
          await signOutGoogle();
          setAuthUser(null);
          pushAlert('Signed Out', 'Signed out of Google account.');
        }}
      />

      <LevelGuideModal selectedLevel={guideLevel} onClose={() => setGuideLevel(null)} />

      <BloomCoach
        messages={chatHistory}
        onMessagesChange={setChatHistory}
        coachGender={coachGender}
        onCoachGenderChange={setCoachGender}
        onLogActivity={logActivity}
      />
    </main>
  );
}