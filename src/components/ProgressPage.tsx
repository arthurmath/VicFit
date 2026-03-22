import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { cn } from '@/lib/utils'

interface ProgressPageProps {
  userId: string
}

interface WeightEntry {
  id?: string
  date: string
  weight: number
}

const TARGET_WEIGHT = 50

function localDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function ProgressPage({ userId }: ProgressPageProps) {
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  
  const [inputDate, setInputDate] = useState<string>(localDate())
  const [inputWeight, setInputWeight] = useState<string>('')
  const [saving, setSaving] = useState(false)

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
      setEntries(data as WeightEntry[])
      if (data.length > 0) {
        // Préremplir le poids avec la dernière valeur connue si le champ est vide
        const lastWeight = data[data.length - 1].weight
        setInputWeight(String(lastWeight))
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    loadData()
  }, [userId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!inputDate || !inputWeight) return

    const weightNum = parseFloat(inputWeight)
    if (isNaN(weightNum)) return

    setSaving(true)

    const { data: existing } = await supabase
      .from('weight_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('date', inputDate)
      .maybeSingle()

    let error
    if (existing) {
      const res = await supabase
        .from('weight_entries')
        .update({ weight: weightNum })
        .eq('id', existing.id)
      error = res.error
    } else {
      const res = await supabase
        .from('weight_entries')
        .insert([{ user_id: userId, date: inputDate, weight: weightNum }])
      error = res.error
    }
    
    if (error) {
      console.error('Erreur Supabase lors de la sauvegarde du poids:', error)
      alert(`Erreur lors de la sauvegarde: ${error.message}`)
    } else {
      await loadData()
      // Optionnel : réinitialiser la date à aujourd'hui
      setInputDate(localDate())
    }

    setSaving(false)
  }

  const chartData = useMemo(() => {
    return entries.map(entry => {
      const d = new Date(entry.date + 'T12:00:00')
      return {
        ...entry,
        displayDate: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        timestamp: d.getTime()
      }
    })
  }, [entries])

  // Calcul des min/max pour l'axe Y pour un meilleur rendu
  const yDomain = useMemo(() => {
    if (entries.length === 0) return [45, 70]
    const weights = entries.map(e => e.weight)
    const min = Math.min(...weights, TARGET_WEIGHT+2)
    const max = Math.max(...weights)
    return [Math.floor(min) - 2, Math.ceil(max) + 2]
  }, [entries])

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

        {/* Chart Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-gray-700">Courbe de poids</span>
            <span className="text-xs font-medium bg-teal-100 text-teal-700 px-2 py-1 rounded-lg">
              🎯 Objectif : {TARGET_WEIGHT} kg
            </span>
          </div>

          <div className="h-64 w-full">
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
                    itemStyle={{ color: '#0d9488', fontWeight: 'bold' }}
                    labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <ReferenceLine y={TARGET_WEIGHT} stroke="#10b981" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    name="Poids (kg)"
                    stroke="#0d9488" 
                    strokeWidth={3}
                    dot={{ fill: '#0d9488', strokeWidth: 2, r: 4, stroke: '#fff' }}
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

        {/* Input Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            ⚖️ Nouvelle pesée
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</label>
                <input 
                  type="date" 
                  required
                  max={localDate()}
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Poids (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  placeholder="ex: 65.5"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !inputWeight || !inputDate}
              className={cn(
                'w-full py-3 rounded-xl font-semibold text-white transition-all mt-2',
                saving || !inputWeight || !inputDate
                  ? 'bg-gray-300'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-500/25',
              )}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer le poids'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}