import { useEffect, useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, useXAxisScale, useYAxisScale } from 'recharts'
import { Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface NicotinePageProps {
  userId: string
}

interface NicotineEntry {
  date: string
  nicotine_ml: number | null
  start_time: string | null
  end_time: string | null
  cigarettes: number
  high_strength: boolean
}

type DayStatus = 'green' | 'yellow' | 'red' | 'empty'

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const VIAL_MAX_MG = 10
const CHART_START = '2026-08-24'
const CHART_END = '2027-02-15'
const HOURS_TAPER_START = '2026-11-01'
const LS_KEY = (userId: string) => `vicfit-nicotine-${userId}`

interface ChartPoint {
  date: string
  idx: number
  ml: number | null
  hours: number | null
  mlGoal: number
  hoursGoal: number
}

function localDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yesterdayDate(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return localDate(d)
}

function blankEntry(date: string): NicotineEntry {
  return {
    date,
    nicotine_ml: null,
    start_time: null,
    end_time: null,
    cigarettes: 0,
    high_strength: false,
  }
}

function timeToMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function durationHours(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  const a = timeToMinutes(start)
  const b = timeToMinutes(end)
  if (a === null || b === null || b <= a) return null
  return Math.round(((b - a) / 60) * 100) / 100
}

function formatDuration(start: string | null, end: string | null): string {
  const hours = durationHours(start, end)
  if (hours === null) return '—'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function formatTimeLabel(time: string | null): string {
  if (!time) return ''
  const mins = timeToMinutes(time)
  if (mins === null) return time
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function dayStatus(entry: NicotineEntry | undefined): DayStatus {
  if (!entry) return 'empty'
  if (entry.cigarettes > 0) return 'red'
  if (entry.high_strength) return 'yellow'
  return 'green'
}

function readLocal(userId: string): NicotineEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY(userId))
    return raw ? (JSON.parse(raw) as NicotineEntry[]) : []
  } catch {
    return []
  }
}

function writeLocal(userId: string, entries: NicotineEntry[]) {
  localStorage.setItem(LS_KEY(userId), JSON.stringify(entries))
}

function toMap(list: NicotineEntry[]): Record<string, NicotineEntry> {
  const map: Record<string, NicotineEntry> = {}
  for (const e of list) map[e.date] = e
  return map
}

function nicotineGoal(date: string): number {
  const month = date.slice(0, 7)
  if (month <= '2026-09') return 2
  if (month === '2026-10') return 1
  return 0
}

function hoursGoal(date: string): number {
  if (date < HOURS_TAPER_START) return 13
  const start = new Date(HOURS_TAPER_START + 'T12:00:00')
  const day = new Date(date + 'T12:00:00')
  const daysSince = Math.round((day.getTime() - start.getTime()) / 86_400_000)
  const minutes = 13 * 60 - (daysSince + 1) * 15
  return Math.max(0, minutes) / 60
}

function daysFromStart(date: string): number {
  const a = new Date(CHART_START + 'T12:00:00').getTime()
  const b = new Date(date + 'T12:00:00').getTime()
  return Math.round((b - a) / 86_400_000)
}

const CHART_LAST_IDX = daysFromStart(CHART_END)
const MONTH_TICK_DATES = [CHART_START, '2026-09-01', '2026-10-01', '2026-11-01', '2026-12-01', '2027-01-01', '2027-02-01']
const MONTH_TICK_IDX = MONTH_TICK_DATES.map(daysFromStart)
const MONTH_TICK_LABEL: Record<number, string> = Object.fromEntries(
  MONTH_TICK_DATES.map((date) => [
    daysFromStart(date),
    new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { month: 'short' }),
  ]),
)

function formatHoursValue(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function buildEvolutionData(entries: Record<string, NicotineEntry>): ChartPoint[] {
  const points: ChartPoint[] = []
  const cursor = new Date(CHART_START + 'T12:00:00')
  const end = new Date(CHART_END + 'T12:00:00')
  while (cursor <= end) {
    const date = localDate(cursor)
    const entry = entries[date]
    points.push({
      date,
      idx: daysFromStart(date),
      ml: entry?.nicotine_ml ?? null,
      hours: durationHours(entry?.start_time ?? null, entry?.end_time ?? null),
      mlGoal: nicotineGoal(date),
      hoursGoal: hoursGoal(date),
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return points
}

export default function NicotinePage({ userId }: NicotinePageProps) {
  const today = useMemo(() => localDate(), [])
  const yesterday = useMemo(() => yesterdayDate(), [])
  const [entries, setEntries] = useState<Record<string, NicotineEntry>>({})
  const [selectedDate, setSelectedDate] = useState(today)
  const [editEntry, setEditEntry] = useState<NicotineEntry>(blankEntry(today))
  const [saving, setSaving] = useState(false)
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const monthDates = useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    let firstDayIdx = firstDay.getDay() - 1
    if (firstDayIdx === -1) firstDayIdx = 6
    const dates: (string | null)[] = []
    for (let i = 0; i < firstDayIdx; i++) dates.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) dates.push(localDate(new Date(year, month, i)))
    return dates
  }, [currentMonthDate])

  async function loadData() {
    const { data, error } = await supabase
      .from('nicotine_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (!error && data) {
      const list = data as NicotineEntry[]
      writeLocal(userId, list)
      setEntries(toMap(list))
      return
    }

    setEntries(toMap(readLocal(userId)))
  }

  useEffect(() => {
    loadData()
  }, [userId])

  useEffect(() => {
    setEditEntry(entries[selectedDate] ? { ...entries[selectedDate] } : blankEntry(selectedDate))
  }, [selectedDate, entries])

  function handleDayClick(date: string) {
    if (date > today) return
    setSelectedDate(date)
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      user_id: userId,
      date: editEntry.date,
      nicotine_ml: editEntry.nicotine_ml,
      start_time: editEntry.start_time,
      end_time: editEntry.end_time,
      cigarettes: editEntry.cigarettes,
      high_strength: editEntry.high_strength,
    }

    const nextEntry = { ...editEntry }
    const next = { ...entries, [nextEntry.date]: nextEntry }
    setEntries(next)
    writeLocal(userId, Object.values(next))

    const { error } = await supabase.from('nicotine_entries').upsert(payload, { onConflict: 'user_id,date' })
    if (error) {
      console.warn('nicotine_entries:', error.message)
    }

    setSaving(false)
  }

  const yesterdayEntry = entries[yesterday]
  const weekAvg = useMemo(() => {
    const values: number[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ml = entries[localDate(d)]?.nicotine_ml
      if (ml !== null && ml !== undefined) values.push(ml)
    }
    if (values.length === 0) return null
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }, [entries])
  const chartData = useMemo(() => buildEvolutionData(entries), [entries])

  return (
    <div className="min-h-screen pb-28">
      <div className="px-4 pt-14 safe-top space-y-4">
        <div className="pt-2 pb-1">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">Nicotine 💨</h1>
          <p className="text-white/80 text-sm font-medium drop-shadow mt-1">Suis ta conso au quotidien</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Hier — {new Date(yesterday + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-start justify-around gap-4">
            <NicotineVial ml={yesterdayEntry?.nicotine_ml ?? 0} weekAvg={weekAvg} />
            <TimeGraduation
              start={yesterdayEntry?.start_time ?? null}
              end={yesterdayEntry?.end_time ?? null}
            />
          </div>
        </div>

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
              if (!date) return <div key={`empty-${i}`} />

              const entry = entries[date]
              const status = dayStatus(entry)
              const isFuture = date > today
              const isToday = date === today
              const isSelected = date === selectedDate
              const dayNum = parseInt(date.split('-')[2], 10)

              return (
                <button
                  key={date}
                  onClick={() => handleDayClick(date)}
                  disabled={isFuture}
                  aria-label={date}
                  className={cn('flex flex-col items-center gap-1 transition-all', isFuture && 'opacity-35')}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all border-2',
                      status === 'green' && 'bg-emerald-100 border-emerald-400 text-emerald-600',
                      status === 'yellow' && 'bg-amber-100 border-amber-400 text-amber-600',
                      status === 'red' && 'bg-rose-100 border-rose-400 text-rose-600',
                      status === 'empty' && !isFuture && 'bg-white border-dashed border-gray-300 text-gray-400',
                      status === 'empty' && isFuture && 'bg-gray-50 border-gray-200 text-gray-300',
                      isSelected && 'ring-2 ring-blue-400 ring-offset-2 scale-110',
                      isToday && status === 'empty' && 'border-blue-400 bg-blue-50 text-blue-500',
                      isToday && status !== 'empty' && 'ring-2 ring-blue-400 ring-offset-1',
                    )}
                  >
                    {isFuture ? (
                      <span className="text-sm font-semibold text-gray-400">{dayNum}</span>
                    ) : status === 'red' ? (
                      <span className="text-base leading-none">🚬</span>
                    ) : status === 'yellow' ? (
                      <span className="text-base leading-none">💨</span>
                    ) : status === 'empty' ? (
                      <span className="text-lg leading-none pb-0.5">+</span>
                    ) : (
                      <span className="text-sm">✓</span>
                    )}
                  </div>
                  <span className="text-[9px] font-medium text-gray-400 leading-none">{dayNum}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">
            📝 Saisie — {DAY_NAMES[(() => { const d = new Date(selectedDate + 'T12:00:00').getDay() - 1; return d === -1 ? 6 : d })()]}{' '}
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </h2>

          <Field label="Taux de nicotine">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="ex: 3"
                value={editEntry.nicotine_ml ?? ''}
                onChange={(e) =>
                  setEditEntry({
                    ...editEntry,
                    nicotine_ml: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">mg</span>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Heure début vape">
              <input
                type="time"
                value={editEntry.start_time ?? ''}
                onChange={(e) => setEditEntry({ ...editEntry, start_time: e.target.value || null })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </Field>
            <Field label="Heure fin vape">
              <input
                type="time"
                value={editEntry.end_time ?? ''}
                onChange={(e) => setEditEntry({ ...editEntry, end_time: e.target.value || null })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </Field>
          </div>

          <Field label="Combien de cigarettes">
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={editEntry.cigarettes}
              onChange={(e) =>
                setEditEntry({ ...editEntry, cigarettes: Math.max(0, Number(e.target.value) || 0) })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </Field>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Vape à 10/20mg</p>
            <div className="flex gap-2">
              <button
                onClick={() => setEditEntry({ ...editEntry, high_strength: true })}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95',
                  editEntry.high_strength ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-gray-100 text-gray-500',
                )}
              >
                Oui
              </button>
              <button
                onClick={() => setEditEntry({ ...editEntry, high_strength: false })}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95',
                  !editEntry.high_strength ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-gray-100 text-gray-500',
                )}
              >
                Non
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-white transition-all',
              saving
                ? 'bg-gray-300'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-500/25',
            )}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer ✓'}
          </button>
        </div>

        <EvolutionCharts data={chartData} />
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  )
}

function NicotineVial({ ml, weekAvg }: { ml: number; weekAvg: number | null }) {
  const fill = Math.max(0, Math.min(ml / VIAL_MAX_MG, 1))
  const liquidTop = 86 - fill * 52
  const label = Number.isInteger(ml) ? `${ml}` : ml.toFixed(1)
  const avgLabel = weekAvg === null ? '—' : `${weekAvg.toFixed(1)} mg`

  return (
    <div className="relative flex flex-col items-center mt-5">
      <div className="relative">
        <span className="absolute right-full bottom-0 mr-0 flex items-center gap-0.5 text-[9px] font-bold text-red-500 whitespace-nowrap">
          objectif
          <svg width="8" height="7" viewBox="0 0 12 11" className="translate-x-2.5" aria-hidden>
            <polygon points="12,5.5 0,0 0,11" fill="#ef4444" />
          </svg>
        </span>
        <svg viewBox="20 0 50 112" className="w-[72px] h-[122px]">
          <defs>
            <linearGradient id="vial-liquid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="vial-glass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.35" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.2" />
            </linearGradient>
            <clipPath id="vial-body">
              <path d="M28 34 C28 30 32 28 36 28 L54 28 C58 28 62 30 62 34 L62 88 C62 100 54 108 45 108 L45 108 C36 108 28 100 28 88 Z" />
            </clipPath>
          </defs>

          <rect x="38" y="4" width="14" height="10" rx="3" fill="#334155" />
          <rect x="34" y="12" width="22" height="8" rx="2" fill="#475569" />
          <rect x="40" y="20" width="10" height="8" fill="#94a3b8" />

          <path
            d="M28 34 C28 30 32 28 36 28 L54 28 C58 28 62 30 62 34 L62 88 C62 100 54 108 45 108 L45 108 C36 108 28 100 28 88 Z"
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {fill > 0 && (
            <g clipPath="url(#vial-body)">
              <rect x="28" y={liquidTop} width="34" height={110 - liquidTop} fill="url(#vial-liquid)" />
              <ellipse cx="45" cy={liquidTop} rx="17" ry="3" fill="#93c5fd" />
            </g>
          )}

          <path
            d="M28 34 C28 30 32 28 36 28 L54 28 C58 28 62 30 62 34 L62 88 C62 100 54 108 45 108 C36 108 28 100 28 88 Z"
            fill="url(#vial-glass)"
          />
          <path d="M32 40 C32 40 34 70 33 96" stroke="white" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" fill="none" />

          <text x="45" y="52" textAnchor="middle" fill="#111827" fontSize="11" fontWeight="700">
            {label} mg
          </text>
        </svg>
      </div>
      <p className="mt-0.5 text-center leading-tight">
        <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wide">moy. 7 jours</span>
        <span className="text-xs font-bold text-gray-700">{avgLabel}</span>
      </p>
    </div>
  )
}

function TimeGraduation({ start, end }: { start: string | null; end: string | null }) {
  const startPct = start && timeToMinutes(start) !== null ? (timeToMinutes(start)! / 1440) * 100 : null
  const endPct = end && timeToMinutes(end) !== null ? (timeToMinutes(end)! / 1440) * 100 : null
  const hasRange = startPct !== null && endPct !== null && endPct > startPct
  const hours = formatDuration(start, end)

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-2">
        <div className="flex flex-col justify-between py-0.5 text-[10px] font-semibold text-gray-400 h-[132px]">
          <span>00h</span>
          <span>12h</span>
          <span>00h</span>
        </div>
        <div className="flex flex-col items-center">
          <Clock className="w-4 h-4 text-emerald-500 mb-1" strokeWidth={2.4} aria-hidden />
          <div className="relative w-4 h-[132px]">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1.5 rounded-full bg-gray-100" />
            {hasRange && (
              <div
                className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]"
                style={{ top: `${startPct}%`, height: `${endPct - startPct}%` }}
              />
            )}
          </div>
        </div>
      </div>
      <p className="mt-1 text-[11px] font-semibold text-gray-500">
        {hasRange ? (
          <>
            {formatTimeLabel(start)} → {formatTimeLabel(end)}
            <span className="block text-center text-teal-600">{hours} / j</span>
          </>
        ) : (
          <span className="text-gray-400">nbr h / j</span>
        )}
      </p>
    </div>
  )
}

const CHART_MARGIN = { top: 8, right: 8, left: -22, bottom: 4 }

function DualTooltip({
  active,
  payload,
  actualKey,
  formatActual,
  formatGoal,
}: {
  active?: boolean
  payload?: { payload: ChartPoint }[]
  actualKey: 'ml' | 'hours'
  formatActual: (value: number) => string
  formatGoal: (value: number) => string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const actual = point[actualKey]
  const goal = actualKey === 'ml' ? point.mlGoal : point.hoursGoal
  const dateLabel = new Date(point.date + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="rounded-xl bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1 capitalize">{dateLabel}</p>
      <p className="text-rose-500">Objectif : {formatGoal(goal)}</p>
      <p className="text-gray-600">Réalisé : {actual === null ? '—' : formatActual(actual)}</p>
    </div>
  )
}

function ActualBars({
  data,
  dataKey,
  fill,
}: {
  data: ChartPoint[]
  dataKey: 'ml' | 'hours'
  fill: string
}) {
  const xScale = useXAxisScale()
  const yScale = useYAxisScale()
  if (!xScale || !yScale) return null
  const baseline = yScale(0)
  if (baseline == null) return null

  return (
    <g>
      {data.map((point) => {
        const value = point[dataKey]
        if (value === null) return null
        const x = xScale(point.idx)
        const y = yScale(value)
        if (x == null || y == null) return null
        const height = baseline - y
        if (height <= 0) return null
        return <rect key={point.date} x={x - 4} y={y} width={8} height={height} fill={fill} rx={1.5} />
      })}
    </g>
  )
}

function OverlayChart({
  data,
  actualKey,
  goalKey,
  lineType,
  barColor,
  yMax,
  formatActual,
  formatGoal,
}: {
  data: ChartPoint[]
  actualKey: 'ml' | 'hours'
  goalKey: 'mlGoal' | 'hoursGoal'
  lineType: 'stepAfter' | 'linear'
  barColor: string
  yMax: number
  formatActual: (value: number) => string
  formatGoal: (value: number) => string
}) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="idx"
            domain={[0, CHART_LAST_IDX]}
            ticks={MONTH_TICK_IDX}
            tickFormatter={(idx: number) => MONTH_TICK_LABEL[idx] ?? ''}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            dy={8}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} domain={[0, yMax]} />
          <Tooltip content={<DualTooltip actualKey={actualKey} formatActual={formatActual} formatGoal={formatGoal} />} />
          <ActualBars data={data} dataKey={actualKey} fill={barColor} />
          <Line
            type={lineType}
            dataKey={goalKey}
            name="Objectif"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#f43f5e' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function EvolutionCharts({ data }: { data: ChartPoint[] }) {
  const mlMax = Math.max(4, ...data.map((d) => Math.max(d.ml ?? 0, d.mlGoal)))
  const hoursMax = Math.max(16, ...data.map((d) => Math.max(d.hours ?? 0, d.hoursGoal)))

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-700">📈 Évolution</h2>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
            <span className="w-3 h-0.5 rounded bg-rose-500" />
            Objectif
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
            <span className="w-2 h-2 rounded-sm bg-slate-400" />
            Réalisé
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Taux de nicotine (mg)</p>
        <OverlayChart
          data={data}
          actualKey="ml"
          goalKey="mlGoal"
          lineType="stepAfter"
          barColor="#2563eb"
          yMax={mlMax}
          formatActual={(v) => `${v} mg`}
          formatGoal={(v) => `${v} mg`}
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Heures vapotées / jour</p>
        <OverlayChart
          data={data}
          actualKey="hours"
          goalKey="hoursGoal"
          lineType="linear"
          barColor="#10b981"
          yMax={hoursMax}
          formatActual={formatHoursValue}
          formatGoal={formatHoursValue}
        />
      </div>
    </div>
  )
}
