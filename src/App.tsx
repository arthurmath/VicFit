import { useState, useEffect } from 'react'
import HomePage from '@/components/HomePage'
import BottomNav from '@/components/BottomNav'
import AuthScreen from '@/components/AuthScreen'

function Background() {
  return (
    <div 
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[100dvh] -z-10 bg-cover bg-center"
      style={{ backgroundImage: 'url(/bg-sky.jpg)' }} 
    />
  )
}

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail')
    if (storedEmail) {
      setUserEmail(storedEmail)
    }
    setLoading(false)
  }, [])

  function handleLogin(email: string) {
    localStorage.setItem('userEmail', email)
    setUserEmail(email)
  }

  function handleLogout() {
    localStorage.removeItem('userEmail')
    setUserEmail(null)
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto relative min-h-screen flex items-center justify-center">
        <Background />
        <p className="text-2xl font-bold text-white drop-shadow-md animate-pulse">VicFit 💪</p>
      </div>
    )
  }

  if (!userEmail) {
    return (
      <div className="max-w-md mx-auto relative min-h-screen">
        <Background />
        <AuthScreen onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto relative min-h-screen">
      <Background />
      <HomePage userId={userEmail} userEmail={userEmail} onLogout={handleLogout} />
      <BottomNav />
    </div>
  )
}
