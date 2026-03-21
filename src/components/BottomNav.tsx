import { Home, Apple, Dumbbell, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { icon: Home, label: 'Accueil', active: true },
  { icon: Apple, label: 'Nutrition', active: false },
  { icon: Dumbbell, label: 'Sport', active: false },
  { icon: TrendingUp, label: 'Progrès', active: false },
  { icon: User, label: 'Profil', active: false },
]

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 safe-bottom bg-white/80 backdrop-blur-xl border-t border-gray-200/60 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.label}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95',
                tab.active ? 'text-teal-600' : 'text-gray-400',
              )}
            >
              <div className={cn('relative', tab.active && 'drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]')}>
                <Icon className="w-5 h-5" strokeWidth={tab.active ? 2.5 : 1.8} />
                {tab.active && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full" />
                )}
              </div>
              <span className={cn('text-[10px] font-medium', tab.active ? 'text-teal-600' : 'text-gray-400')}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
