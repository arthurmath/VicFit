import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import HomePage from '@/components/HomePage'
import BottomNav, { type TabId } from '@/components/BottomNav'
import AuthScreen from '@/components/AuthScreen'
import ProgressPage from '@/components/ProgressPage'
import type { User } from '@supabase/supabase-js'

function Background() {
  return (
    <div 
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[100dvh] -z-10 bg-cover bg-center"
      style={{ backgroundImage: 'url(/bg-sky.jpg)' }} 
    />
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('home')

  useEffect(() => {
    // Vérifie s'il y a déjà une session active au lancement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écoute les changements de connexion/déconnexion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto relative min-h-screen flex items-center justify-center">
        <Background />
        <p className="text-2xl font-bold text-white drop-shadow-md animate-pulse">VicFit 💪</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto relative min-h-screen">
        <Background />
        <AuthScreen />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto relative min-h-screen">
      <Background />
      {activeTab === 'home' && (
        <HomePage 
          userId={user.id} 
          userEmail={user.email || ''} 
          onLogout={handleLogout} 
          onNavigateToProgress={() => setActiveTab('progress')}
        />
      )}
      {activeTab === 'progress' && (
        <ProgressPage userId={user.id} />
      )}
      {/* Autres pages à venir */}
      {['nutrition', 'sport', 'profile'].includes(activeTab) && (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white text-lg font-medium drop-shadow-md">Page en construction 🚧</p>
        </div>
      )}
      
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}
