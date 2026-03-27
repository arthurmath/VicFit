import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = 'BCUz36Xn1DX2I7YI7JD4uGGg3UVKHFUgww_WFSN1IiYdav3PMyamqRv_GKyhjo-gbFRLWLztJ-3F3uq9Aoh9uR4'

export default function PushNotificationManager({ userId }: { userId: string }) {
  useEffect(() => {
    async function initPush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return
      }

      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        // Si déjà abonné, on s'assure que Supabase a bien l'info (au cas où l'utilisateur se reconnecte sur un autre appareil)
        if (subscription) {
          await saveSubscription(subscription)
          return
        }

        // Sinon, on tente l'abonnement automatique
        // Note: Sur iOS, requestPermission nécessite souvent un geste utilisateur. 
        // Si ça échoue ici, l'abonnement se fera au prochain rechargement après une interaction utilisateur.
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          })
          await saveSubscription(newSubscription)
        }
      } catch (err) {
        console.error('Failed to auto-subscribe to push notifications:', err)
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

    initPush()
  }, [userId])

  return null // Composant invisible
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
