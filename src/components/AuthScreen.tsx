import { useState } from 'react'

export default function AuthScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (email) {
      onLogin(email)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-1">VicFit 💪</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Ton suivi nutrition & motivation</p>

        <form onSubmit={handleLogin}>
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

          <button
            type="submit"
            disabled={!email}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:active:scale-100"
          >
            Se connecter 🚀
          </button>
        </form>
      </div>
    </div>
  )
}
