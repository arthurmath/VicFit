import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { cn } from '@/lib/utils'

interface ProgressPageProps {
  userId: string
}

interface ProgressEntry {
  id?: string
  date: string
  weight?: number
  bras?: number
  taille?: number
  hanche?: number
  cuisse?: number
  molet?: number
}

interface MeasurementType {
  key: keyof Omit<ProgressEntry, 'id' | 'date'>
  label: string
  unit: string
  icon: string
  color: string
  target?: number
}

const TARGET_WEIGHT = 50

const MEASUREMENT_TYPES: MeasurementType[] = [
  { key: 'weight', label: 'Poids', unit: 'kg', icon: '⚖️', color: '#0d9488', target: TARGET_WEIGHT },
  { key: 'bras', label: 'Bras', unit: 'cm', icon: '💪', color: '#8b5cf6' },
  { key: 'taille', label: 'Taille', unit: 'cm', icon: '📏', color: '#f59e0b' },
  { key: 'hanche', label: 'Hanche', unit: 'cm', icon: '🍑', color: '#ec4899' },
  { key: 'cuisse', label: 'Cuisse', unit: 'cm', icon: '🦵', color: '#3b82f6' },
  { key: 'molet', label: 'Molet', unit: 'cm', icon: '🦶', color: '#ef4444' }
]

function localDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function ProgressPage({ userId }: ProgressPageProps) {
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  
  // States for inputs per measurement type
  const [inputDates, setInputDates] = useState<Record<string, string>>(
    Object.fromEntries(MEASUREMENT_TYPES.map(m => [m.key, localDate()]))
  )
  const [inputValues, setInputValues] = useState<Record<string, string>>({})

  async function loadData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (error) {
      console.error("Erreur chargement weight_entries:", error)
    } else if (data) {
      setEntries(data as ProgressEntry[])
      
      // Préremplir les inputs avec les dernières valeurs connues
      if (data.length > 0) {
        const lastEntry = data[data.length - 1]
        const newValues: Record<string, string> = {}
        MEASUREMENT_TYPES.forEach(m => {
          if (lastEntry[m.key] !== undefined && lastEntry[m.key] !== null) {
            newValues[m.key] = String(lastEntry[m.key])
          }
        })
        setInputValues(prev => ({ ...prev, ...newValues }))
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [userId])

  async function handleSave(key: keyof Omit<ProgressEntry, 'id' | 'date'>, e: React.FormEvent) {
    e.preventDefault()
    const date = inputDates[key]
    const val = inputValues[key]
    if (!date || !val) return

    const numVal = parseFloat(val)
    if (isNaN(numVal)) return

    setSavingKey(key)

    const { data: existing } = await supabase
      .from('weight_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle()

    let error
    if (existing) {
      const res = await supabase
        .from('weight_entries')
        .update({ [key]: numVal })
        .eq('id', existing.id)
      error = res.error
    } else {
      const res = await supabase
        .from('weight_entries')
        .insert([{ user_id: userId, date: date, [key]: numVal }])
      error = res.error
    }
    
    if (error) {
      console.error(`Erreur Supabase lors de la sauvegarde de ${key}:`, error)
      alert(`Erreur lors de la sauvegarde: ${error.message}`)
    } else {
      await loadData()
    }

    setSavingKey(null)
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="px-4 pt-14 safe-top space-y-6">
        {/* Header */}
        <div className="pt-2 pb-1">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">
            Mon Évolution 📈
          </h1>
          <p className="text-white/80 text-sm font-medium drop-shadow mt-1">
            Suis ton objectif pas à pas
          </p>
        </div>

        {/* Measurement Widgets */}
        {MEASUREMENT_TYPES.map((m) => (
          <MeasurementWidget
            key={m.key}
            m={m}
            entries={entries}
            loading={loading}
            saving={savingKey === m.key}
            inputDate={inputDates[m.key]}
            inputValue={inputValues[m.key] || ''}
            onInputChange={(val) => setInputValues(prev => ({ ...prev, [m.key]: val }))}
            onDateChange={(date) => setInputDates(prev => ({ ...prev, [m.key]: date }))}
            onSave={(e) => handleSave(m.key, e)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MeasurementWidgetProps {
  m: MeasurementType
  entries: ProgressEntry[]
  loading: boolean
  saving: boolean
  inputDate: string
  inputValue: string
  onInputChange: (val: string) => void
  onDateChange: (date: string) => void
  onSave: (e: React.FormEvent) => void
}

function MeasurementWidget({ 
  m, 
  entries, 
  loading, 
  saving, 
  inputDate, 
  inputValue, 
  onInputChange, 
  onDateChange, 
  onSave 
}: MeasurementWidgetProps) {
  const chartData = useMemo(() => {
    return entries
      .filter(entry => entry[m.key] !== undefined && entry[m.key] !== null)
      .map(entry => {
        const d = new Date(entry.date + 'T12:00:00')
        return {
          ...entry,
          displayDate: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          value: entry[m.key]
        }
      })
  }, [entries, m.key])

  const yDomain = useMemo(() => {
    const values = chartData.map(e => e.value as number)
    if (values.length === 0) return [0, 100]
    const min = Math.min(...values, m.target ? m.target - 2 : values[0])
    const max = Math.max(...values, m.target ? m.target + 2 : values[0])
    return [Math.floor(min) - 2, Math.ceil(max) + 2]
  }, [chartData, m.target])

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg flex flex-col gap-4">
      {/* Chart Part */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">{m.icon}</span>
            <span className="text-sm font-semibold text-gray-700">{m.label}</span>
          </div>
          {m.target && (
            <span className="text-xs font-medium bg-teal-100 text-teal-700 px-2 py-1 rounded-lg">
              🎯 Objectif : {m.target} {m.unit}
            </span>
          )}
        </div>

        <div className="h-48 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis 
                  domain={yDomain}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: m.color, fontWeight: 'bold' }}
                  labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
                />
                {m.target && <ReferenceLine y={m.target} stroke="#10b981" strokeDasharray="3 3" />}
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={`${m.label} (${m.unit})`}
                  stroke={m.color} 
                  strokeWidth={3}
                  dot={{ fill: m.color, strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <span className="text-2xl">📉</span>
              <span className="text-sm">Aucune donnée pour le moment</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Part */}
      <div className="pt-4 border-t border-gray-100">
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</label>
              <input 
                type="date" 
                required
                max={localDate()}
                value={inputDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{m.label} ({m.unit})</label>
              <input 
                type="number" 
                step="0.1"
                required
                placeholder="ex: 0.0"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !inputValue || !inputDate}
            className={cn(
              'w-full py-2.5 rounded-xl font-semibold text-white transition-all',
              saving || !inputValue || !inputDate
                ? 'bg-gray-300'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-500/25',
            )}
            style={!saving && inputValue && inputDate && m.key !== 'weight' ? { backgroundImage: `linear-gradient(to right, ${m.color}, ${m.color}dd)` } : {}}
          >
            {saving ? 'Enregistrement...' : `Enregistrer ${m.label.toLowerCase()}`}
          </button>
        </form>
      </div>
    </div>
  )
}
