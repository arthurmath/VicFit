import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage("Compte créé ! Vérifie tes emails si un lien de confirmation a été envoyé.")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-1">VicFit 💪</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Ton suivi nutrition & motivation</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-3 bg-emerald-100 text-emerald-700 text-sm rounded-xl">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Adresse email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="victoire@example.com"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent mb-4 text-base"
          />

          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent mb-6 text-base"
          />

          <button
            type="submit"
            disabled={!email || !password || loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:active:scale-100 mb-4"
          >
            {loading ? 'Chargement...' : (isSignUp ? 'Créer mon compte 🚀' : 'Se connecter 🚀')}
          </button>
        </form>

        <button 
          type="button" 
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
            setMessage(null)
          }}
          className="w-full text-sm text-teal-600 font-medium hover:underline text-center"
        >
          {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
        </button>
      </div>
    </div>
  )
}
