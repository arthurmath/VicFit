import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell, BellOff, Info } from 'lucide-react'

const VAPID_PUBLIC_KEY = 'BCUz36Xn1DX2I7YI7JD4uGGg3UVKHFUgww_WFSN1IiYdav3PMyamqRv_GKyhjo-gbFRLWLztJ-3F3uq9Aoh9uR4'

export default function PushNotificationManager({ userId }: { userId: string }) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsStandalone(isStandaloneMode)
    setIsIOS(isIOSDevice)

    // On iOS, les notifications ne marchent QUE en mode standalone (Add to Home Screen)
    if (isIOSDevice && !isStandaloneMode) {
      setShowBanner(true)
    } else if (Notification.permission !== 'granted') {
      setShowBanner(true)
    }

    async function checkSubscription() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPermission('unsupported')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await saveSubscription(subscription)
      }
    }

    checkSubscription()
  }, [userId])

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        })
        await saveSubscription(newSubscription)
        setShowBanner(false)
      }
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err)
    }
  }

  async function saveSubscription(subscription: PushSubscription) {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: JSON.parse(JSON.stringify(subscription))
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('Error saving subscription to Supabase:', error)
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed top-[calc(env(safe-area-inset-top)+1rem)] left-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-emerald-100 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          {isIOS && !isStandalone ? (
            <Info className="w-5 h-5 text-emerald-600" />
          ) : (
            <Bell className="w-5 h-5 text-emerald-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900">
            {isIOS && !isStandalone ? 'Installe l\'app' : 'Active les rappels'}
          </h3>
          <p className="text-xs text-gray-500 leading-tight">
            {isIOS && !isStandalone 
              ? 'Pour recevoir les notifications, clique sur Partager puis "Sur l\'écran d\'accueil".'
              : 'Reçois un petit message chaque soir pour ne pas oublier tes progrès !'}
          </p>
        </div>

        {(!isIOS || isStandalone) && permission !== 'granted' && (
          <button
            onClick={subscribeToPush}
            className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-transform whitespace-nowrap"
          >
            Activer
          </button>
        )}
        
        <button 
          onClick={() => setShowBanner(false)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <BellOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
