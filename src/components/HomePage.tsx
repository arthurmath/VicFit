import { Flame, Dumbbell, Apple, TrendingUp, ChevronRight, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Calories aujourd\'hui', value: '1 840', unit: 'kcal', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { label: 'Séances cette semaine', value: '3', unit: 'sessions', color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { label: 'Streak actuel', value: '12', unit: 'jours', color: 'text-purple-400', bg: 'bg-purple-500/10' },
]

const quickActions = [
  { icon: Apple, label: 'Ajouter repas', color: 'from-orange-500 to-red-500', desc: 'Petit-déj, déjeuner...' },
  { icon: Dumbbell, label: 'Logger séance', color: 'from-brand-500 to-emerald-400', desc: 'Cardio, muscu, yoga...' },
  { icon: TrendingUp, label: 'Voir progrès', color: 'from-purple-500 to-indigo-500', desc: 'Courbes & stats' },
]

const recentMeals = [
  { name: 'Porridge avoine', time: '08:30', kcal: 320, emoji: '🥣' },
  { name: 'Poulet grillé + riz', time: '12:45', kcal: 580, emoji: '🍗' },
  { name: 'Smoothie banane', time: '16:00', kcal: 210, emoji: '🥤' },
]

export default function HomePage() {
  const now = new Date()
  const hours = now.getHours()
  const greeting =
    hours < 12 ? 'Bonjour' : hours < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-brand-900/40 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative px-5 pt-14 pb-8 safe-top">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-zinc-400 text-sm font-medium tracking-wide uppercase">
                {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-2xl font-bold mt-0.5">
                {greeting}, Victoire{' '}
                <span className="inline-block animate-bounce">👋</span>
              </h1>
            </div>
            <button className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <span className="text-lg">🦁</span>
            </button>
          </div>

          {/* Daily goal ring card */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#27272a" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - 0.72)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#86efac" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-bold text-brand-400">72%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-1">Objectif calorique</p>
                <p className="text-2xl font-bold">
                  1 840 <span className="text-zinc-500 text-sm font-normal">/ 2 500 kcal</span>
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-zinc-400">660 kcal restantes</span>
                  <span className="text-zinc-700 mx-1">·</span>
                  <Zap className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-xs text-zinc-400">streak 12j</span>
                </div>
              </div>
            </div>

            {/* Macros bar */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Protéines', current: 98, goal: 150, color: 'bg-brand-500' },
                { label: 'Glucides', current: 210, goal: 250, color: 'bg-orange-500' },
                { label: 'Lipides', current: 55, goal: 80, color: 'bg-purple-500' },
              ].map((macro) => (
                <div key={macro.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-zinc-500">{macro.label}</span>
                    <span className="text-xs text-zinc-400 font-medium">{macro.current}g</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', macro.color)}
                      style={{ width: `${Math.min((macro.current / macro.goal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 mt-2">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn('rounded-xl p-3 border border-zinc-800/60', stat.bg)}
            >
              <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-tight">{stat.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Actions rapides</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 active:scale-95 transition-transform"
              >
                <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center', action.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-white leading-tight">{action.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{action.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Today's meals */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Repas du jour</h2>
          <button className="flex items-center gap-1 text-brand-400 text-xs font-medium">
            Tout voir <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2.5">
          {recentMeals.map((meal) => (
            <div
              key={meal.name}
              className="flex items-center gap-3 p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl"
            >
              <span className="text-2xl">{meal.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{meal.name}</p>
                <p className="text-xs text-zinc-500">{meal.time}</p>
              </div>
              <span className="text-sm font-semibold text-orange-400">{meal.kcal} kcal</span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation banner */}
      <div className="px-5 mt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-500 p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-semibold text-brand-100 uppercase tracking-wide">Motivation du jour</span>
            </div>
            <p className="text-white font-semibold text-base leading-snug text-balance">
              "Le corps atteint ce que l'esprit croit."
            </p>
            <p className="text-brand-100 text-xs mt-2">Continue comme ça, tu es à 72% de ton objectif 💪</p>
          </div>
        </div>
      </div>
    </div>
  )
}
