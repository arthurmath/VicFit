import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

type Breakfast = 'sain' | 'pas_sain' | 'skip'
type LunchDinner = 'sain' | 'cheatmeal'

interface DailyEntry {
  id?: string
  date: string
  breakfast: Breakfast | null
  lunch: LunchDinner | null
  dinner: LunchDinner | null
  dessert: boolean
  snacking: boolean
  alcohol: boolean
  sport: boolean
}

type DayStatus = 'green' | 'yellow' | 'red' | 'empty'

interface HomePageProps {
  userId: string
  userEmail: string
  onLogout: () => void
  onNavigateToProgress: () => void
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TARGET_WEIGHT = 50
const START_WEIGHT = 68

const QUOTES = [
  "Allez ma grande !",
  "T'es trop forte !",
  "You won't always have motivation, so you must have discipline.",
  "T'es la plus belle !",
  "Tu ne regrettes jamais une séance de sport.",
  "Vic t'es la plus fit !",
  "Un esprit sain dans un corps sain.",
  "Trop facile le yoga !",
  "La sueur d'aujourd'hui est le sourire de demain.",
  "Déso Brad Pitt, cette beauté est déjà prise",
  "Tu va retourner ta séance de pilates !",
  "Un pas à la fois, mais toujours vers l'avant.",
  "Bientot le marathon ?",
  "Ralenti, j'arrive déjà plus à courir aussi vite que toi !",
  "Tu vas être la plus belle de ton club de yoga !",
  "Je suis fier de toi",
  "Tout Hermès va être jaloux de toi !",
  "Oh le summer body de dingue !",
  "Aujourd'hui, c'est grande Victoire !",
  "Ceux qui vivent sont ceux qui luttent.",
  "Je pense à toi <3",
  "Réveille-toi avec détermination, endors-toi avec satisfaction.",
  "Go Go Go !!",
  "Attention Kylie Jenner est jalouse !",
  "Le seul mauvais entraînement est celui que tu ne fais pas.",
  "Miaou miaou (c'est Rouxie qui t'encourage)",
  "Tu sera la plus belle à la plage cet été !",
]

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// ─── Helpers ────────────────────────────────────────────────────────────────

function localDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function getDailyQuote(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  return QUOTES[dayOfYear % QUOTES.length]
}

function getDayEmojis(entry: DailyEntry): string[] {
  const e: string[] = []
  if (entry.sport) e.push('🏃‍♀️')
  if (entry.lunch === 'cheatmeal' || entry.dinner === 'cheatmeal') e.push('🍟')
  if (entry.alcohol) e.push('🍺')
  if (entry.dessert) e.push('🍦')
  if (entry.snacking) e.push('🍿')
  return e
}

function computeDayStatus(
  entry: DailyEntry | undefined,
  allEntries: Record<string, DailyEntry>,
  dateStr: string,
): DayStatus {
  if (!entry) return 'empty'
  if (entry.snacking) return 'red'

  const dateObj = new Date(dateStr + 'T12:00:00')
  const monday = getMonday(dateObj)
  
  let cheatmeals = 0
  let desserts = 0
  let alcoholDays = 0

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dStr = localDate(d)
    
    if (dStr > dateStr) break

    const e = allEntries[dStr]
    if (!e) continue
    if (e.lunch === 'cheatmeal' || e.dinner === 'cheatmeal') cheatmeals++
    if (e.dessert) desserts++
    if (e.alcohol) alcoholDays++
  }

  const isCheat = entry.lunch === 'cheatmeal' || entry.dinner === 'cheatmeal'
  if (isCheat && cheatmeals > 1) return 'red'
  if (entry.dessert && desserts > 1) return 'red'
  if (entry.alcohol && alcoholDays > 1) return 'red'

  if (entry.alcohol) return 'yellow'
  if (isCheat || entry.dessert || entry.breakfast === 'pas_sain') return 'yellow'

  return 'green'
}

function blankEntry(date: string): DailyEntry {
  return { date, breakfast: null, lunch: null, dinner: null, dessert: false, snacking: false, alcohol: false, sport: false }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function HomePage({ userId, userEmail, onLogout, onNavigateToProgress }: HomePageProps) {
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editEntry, setEditEntry] = useState<DailyEntry | null>(null)
  const [latestWeight, setLatestWeight] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [saving, setSaving] = useState(false)
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const today = useMemo(() => localDate(), [])
  const monthDates = useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    let firstDayIdx = firstDay.getDay() - 1
    if (firstDayIdx === -1) firstDayIdx = 6
    
    const daysInMonth = lastDay.getDate()
    
    const dates: (string | null)[] = []
    for (let i = 0; i < firstDayIdx; i++) dates.push(null)
    for (let i = 1; i <= daysInMonth; i++) dates.push(localDate(new Date(year, month, i)))
    
    return dates
  }, [currentMonthDate])

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bonne après-midi' : 'Bonsoir'
  const displayName = userEmail
    .split('@')[0]
    .split(/[._-]/)[0]
    .replace(/\b\w/g, c => c.toUpperCase())

  // ── Data loading ────────────────────────────────────────────────────────

  async function loadData() {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()
    const fetchStart = new Date(year, month, 1)
    fetchStart.setDate(fetchStart.getDate() - 7)
    const fetchEnd = new Date(year, month + 1, 0)
    fetchEnd.setDate(fetchEnd.getDate() + 7)

    const [entriesRes, weightRes] = await Promise.all([
      supabase.from('daily_entries').select('*').gte('date', localDate(fetchStart)).lte('date', localDate(fetchEnd)),
      supabase.from('weight_entries').select('weight').order('date', { ascending: false }).limit(1).single(),
    ])

    if (entriesRes.error) console.error("Erreur chargement daily_entries:", entriesRes.error)
    if (weightRes.error) console.error("Erreur chargement weight_entries:", weightRes.error)

    if (entriesRes.data) {
      const map: Record<string, DailyEntry> = {}
      for (const e of entriesRes.data) map[e.date] = e as DailyEntry
      setEntries(map)
    }
    if (weightRes.data) setLatestWeight(weightRes.data.weight)

    await loadStreak()
  }

  async function loadStreak() {
    const ninetyAgo = new Date()
    ninetyAgo.setDate(ninetyAgo.getDate() - 90)

    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .gte('date', localDate(ninetyAgo))
      .order('date', { ascending: true })

    if (error) console.error("Erreur chargement streak:", error)

    if (!data || data.length === 0) { setStreak(0); return }

    let lastBadDate: string | null = null

    const weeks = new Map<string, DailyEntry[]>()
    for (const row of data as DailyEntry[]) {
      const key = localDate(getMonday(new Date(row.date + 'T12:00:00')))
      if (!weeks.has(key)) weeks.set(key, [])
      weeks.get(key)!.push(row)
    }

    for (const [, wk] of weeks) {
      wk.sort((a, b) => a.date.localeCompare(b.date))
      let cm = 0, ds = 0, al = 0
      for (const e of wk) {
        const isCheat = e.lunch === 'cheatmeal' || e.dinner === 'cheatmeal'
        if (isCheat) cm++
        if (e.dessert) ds++
        if (e.alcohol) al++
        if (e.snacking || (isCheat && cm > 1) || (e.dessert && ds > 1) || (e.alcohol && al > 1)) {
          lastBadDate = e.date
        }
      }
    }

    const ref = lastBadDate ? new Date(lastBadDate + 'T12:00:00') : new Date(data[0].date + 'T12:00:00')
    setStreak(Math.floor((Date.now() - ref.getTime()) / 86_400_000))
  }

  useEffect(() => { loadData() }, [currentMonthDate]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Interactions ────────────────────────────────────────────────────────

  function handleDayClick(date: string) {
    if (date > today) return
    if (selectedDate === date) {
      setSelectedDate(null)
      setEditEntry(null)
      return
    }
    setSelectedDate(date)
    setEditEntry(entries[date] ? { ...entries[date] } : blankEntry(date))
  }

  async function handleSave() {
    if (!editEntry) return
    setSaving(true)

    const payload = {
      user_id: userId,
      date: editEntry.date,
      breakfast: editEntry.breakfast,
      lunch: editEntry.lunch,
      dinner: editEntry.dinner,
      dessert: editEntry.dessert,
      snacking: editEntry.snacking,
      alcohol: editEntry.alcohol,
      sport: editEntry.sport,
    }

    const { error } = await supabase.from('daily_entries').upsert(payload, { onConflict: 'user_id,date' })
    
    if (error) {
      console.error('Erreur Supabase lors de la sauvegarde:', error)
      alert(`Erreur lors de la sauvegarde: ${error.message}`)
    }

    await loadData()
    setSelectedDate(null)
    setEditEntry(null)
    setSaving(false)
  }

  async function handleSignOut() {
    onLogout()
  }

  // ── Derived values ─────────────────────────────────────────────────────

  const weightProgress = latestWeight
    ? Math.max(0, Math.min(100, ((START_WEIGHT - latestWeight) / (START_WEIGHT - TARGET_WEIGHT)) * 100))
    : 0

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-28">
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+6.5rem)] space-y-4">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-1">
          <div>
            {/* <p className="text-white/80 text-sm font-medium drop-shadow">
              {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p> */}
            <h1 className="text-2xl font-bold text-white drop-shadow-md mt-0.5">
              {greeting} {displayName} 👋
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-sm font-bold text-white shadow-sm active:scale-95 transition-transform"
            title="Déconnexion"
          >
            {displayName.charAt(0)}
          </button>
        </div>

        {/* ── Motivation gauge ───────────────────────────────────────── */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">🔥 Motivation</span>
            <span className="text-xl font-bold text-green-500">
              {streak} <span className="text-sm font-medium text-gray-400">jours</span>
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Sans craquage 💪</p>
        </div>

        {/* ── Weight gauge ───────────────────────────────────────────── */}
        <div 
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
          onClick={onNavigateToProgress}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">⚖️ Objectif Poids</span>
            {latestWeight ? (
              <span className="text-xl font-bold text-teal-600">
                {latestWeight} <span className="text-sm font-medium text-gray-400">kg</span>
              </span>
            ) : (
              <span className="text-sm text-gray-400 italic">Aucune pesée</span>
            )}
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${weightProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-gray-400">{START_WEIGHT} kg</span>
            <span className="text-xs text-gray-400">🎯 {TARGET_WEIGHT} kg</span>
          </div>
        </div>

        {/* ── Daily quote ────────────────────────────────────────────── */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-gray-600 italic text-center leading-relaxed text-balance">
            « {getDailyQuote()} »
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">— Coach Arthur 🦁</p>
        </div>

        {/* ── Monthly view ────────────────────────────────────────────── */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">📅 Semainier</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const d = new Date(currentMonthDate)
                  d.setMonth(d.getMonth() - 1)
                  setCurrentMonthDate(d)
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-700 capitalize w-30 text-center">
                {currentMonthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => {
                  const d = new Date(currentMonthDate)
                  d.setMonth(d.getMonth() + 1)
                  setCurrentMonthDate(d)
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {DAY_LABELS.map((label, i) => (
              <div key={`label-${i}`} className="text-[11px] font-semibold text-gray-400 text-center mb-1">
                {label}
              </div>
            ))}
            {monthDates.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} className="flex-1" />
              }

              const entry = entries[date]
              const status = computeDayStatus(entry, entries, date)
              const isFuture = date > today
              const isToday = date === today
              const isSelected = date === selectedDate
              const emojis = entry ? getDayEmojis(entry) : []

              const dayNum = parseInt(date.split('-')[2], 10)

              return (
                <button
                  key={date}
                  onClick={() => handleDayClick(date)}
                  disabled={isFuture}
                  className={cn('flex flex-col items-center gap-1 transition-all', isFuture && 'opacity-35')}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all border-2 relative',
                      status === 'green' && 'bg-emerald-100 border-emerald-400 text-emerald-600',
                      status === 'yellow' && 'bg-amber-100 border-amber-400 text-amber-600',
                      status === 'red' && 'bg-rose-100 border-rose-400 text-rose-600',
                      status === 'empty' && !isFuture && 'bg-white border-dashed border-gray-300 text-gray-400',
                      status === 'empty' && isFuture && 'bg-gray-50 border-gray-200 text-gray-300',
                      isSelected && 'ring-2 ring-blue-400 ring-offset-2 scale-110',
                      isToday && status === 'empty' && 'border-blue-400 bg-blue-50 text-blue-500',
                      isToday && status !== 'empty' && 'ring-2 ring-blue-400 ring-offset-1'
                    )}
                  >
                    {isFuture ? (
                      <span className="text-sm font-semibold text-gray-400">
                        {dayNum}
                      </span>
                    ) : (
                      <div className="flex items-center justify-center">
                        {emojis.length > 0 ? (
                          <span className="text-[10px] leading-none tracking-tighter">{emojis.slice(0, 2).join('')}</span>
                        ) : status === 'empty' ? (
                          <span className="text-lg leading-none pb-0.5">+</span>
                        ) : (
                          <span className="text-sm">✓</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Daily entry form ───────────────────────────────────────── */}
        {selectedDate && editEntry && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">
              📝 Saisie — {DAY_NAMES[(() => { const d = new Date(selectedDate + 'T12:00:00').getDay() - 1; return d === -1 ? 6 : d })()]}{' '}
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </h2>

            {/* Breakfast */}
            <MealSection label="Petit Déjeuner">
              {([
                ['sain', 'Sain ✅', 'bg-emerald-500 text-white shadow-emerald-200'],
                ['pas_sain', 'Pas Sain ❌', 'bg-rose-500 text-white shadow-rose-200'],
                ['skip', 'Sauté ⏭️', 'bg-gray-500 text-white shadow-gray-200'],
              ] as const).map(([val, label, active]) => (
                <Tag
                  key={val}
                  active={editEntry.breakfast === val}
                  activeClass={active}
                  onClick={() => setEditEntry({ ...editEntry, breakfast: editEntry.breakfast === val ? null : val })}
                >
                  {label}
                </Tag>
              ))}
            </MealSection>

            {/* Lunch */}
            <MealSection label="Déjeuner">
              {([
                ['sain', 'Sain ✅', 'bg-emerald-500 text-white shadow-emerald-200'],
                ['cheatmeal', 'Pas Sain 🍟', 'bg-amber-500 text-white shadow-amber-200'],
              ] as const).map(([val, label, active]) => (
                <Tag
                  key={val}
                  active={editEntry.lunch === val}
                  activeClass={active}
                  onClick={() => setEditEntry({ ...editEntry, lunch: editEntry.lunch === val ? null : val })}
                >
                  {label}
                </Tag>
              ))}
            </MealSection>

            {/* Dinner */}
            <MealSection label="Dîner">
              {([
                ['sain', 'Sain ✅', 'bg-emerald-500 text-white shadow-emerald-200'],
                ['cheatmeal', 'Pas Sain 🍟', 'bg-amber-500 text-white shadow-amber-200'],
              ] as const).map(([val, label, active]) => (
                <Tag
                  key={val}
                  active={editEntry.dinner === val}
                  activeClass={active}
                  onClick={() => setEditEntry({ ...editEntry, dinner: editEntry.dinner === val ? null : val })}
                >
                  {label}
                </Tag>
              ))}
            </MealSection>

            {/* Extras */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Extras</p>
              <div className="grid grid-cols-4 gap-2">
                {([
                  ['dessert', '🍦', 'Dessert', 'bg-pink-50 ring-2 ring-pink-400'],
                  ['snacking', '🍿', 'Grignottage', 'bg-red-50 ring-2 ring-red-400'],
                  ['alcohol', '🍺', 'Alcool', 'bg-amber-50 ring-2 ring-amber-400'],
                  ['sport', '🏃‍♀️', 'Sport', 'bg-blue-50 ring-2 ring-blue-400'],
                ] as const).map(([key, emoji, label, activeClass]) => (
                  <button
                    key={key}
                    onClick={() => setEditEntry({ ...editEntry, [key]: !editEntry[key] })}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all active:scale-95',
                      editEntry[key] ? activeClass : 'bg-gray-50',
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-[10px] font-medium text-gray-600 leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedDate(null); setEditEntry(null) }}
                className="flex-1 py-3 rounded-xl font-semibold text-gray-500 bg-gray-100 active:scale-[0.98] transition-transform"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  'flex-[2] py-3 rounded-xl font-semibold text-white transition-all',
                  saving
                    ? 'bg-gray-300'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-500/25',
                )}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MealSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  )
}

function Tag({
  active,
  activeClass,
  onClick,
  children,
}: {
  active: boolean
  activeClass: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3.5 py-2 rounded-full text-sm font-medium transition-all active:scale-95',
        active ? `${activeClass} shadow-md` : 'bg-gray-100 text-gray-500',
      )}
    >
      {children}
    </button>
  )
}
