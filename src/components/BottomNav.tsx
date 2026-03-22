import React from 'react'
import { Home, Apple, Dumbbell, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabId = 'home' | 'nutrition' | 'sport' | 'progress' | 'profile'

interface BottomNavProps {
  activeTab: TabId
  onChange: (tab: TabId) => void
}

const tabs: { icon: React.ElementType; label: string; id: TabId }[] = [
  { icon: Home, label: 'Accueil', id: 'home' },
  { icon: Apple, label: 'Nutrition', id: 'nutrition' },
  { icon: Dumbbell, label: 'Sport', id: 'sport' },
  { icon: TrendingUp, label: 'Progrès', id: 'progress' },
  { icon: User, label: 'Profil', id: 'profile' },
]

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 safe-bottom bg-white/80 backdrop-blur-xl border-t border-gray-200/60 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95',
                isActive ? 'text-teal-600' : 'text-gray-400',
              )}
            >
              <div className={cn('relative', isActive && 'drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]')}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full" />
                )}
              </div>
              <span className={cn('text-[10px] font-medium', isActive ? 'text-teal-600' : 'text-gray-400')}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
