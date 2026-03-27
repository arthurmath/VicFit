import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// On utilise les variables d'environnement de Vercel
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Clé admin pour tout lire

const publicVapidKey = process.env.VAPID_PUBLIC_KEY!
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!

webpush.setVapidDetails(
  'mailto:contact@vicfit.fr',
  publicVapidKey,
  privateVapidKey
)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Optionnel: vérifier une clé secrète pour que n'importe qui ne puisse pas appeler l'API
  const authHeader = req.headers.authorization
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // 1. Récupérer tous les abonnements
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) throw error

    console.log(`Sending notifications to ${subscriptions.length} users...`)

    const payload = JSON.stringify({
      title: 'VicFit 💪',
      body: 'N\'oublie pas d\'entrer tes informations aujourd\'hui pour suivre tes progrès !',
      url: '/'
    })

    // 2. Envoyer les notifications en parallèle
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload)
          return sub.id
        } catch (err: any) {
          // Si l'abonnement n'est plus valide, on le supprime
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().match({ id: sub.id })
          }
          throw err
        }
      })
    )

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failureCount = results.filter((r) => r.status === 'rejected').length

    return res.status(200).json({
      message: 'Notifications sent',
      success: successCount,
      failures: failureCount
    })
  } catch (err: any) {
    console.error('Error sending notifications:', err)
    return res.status(500).json({ error: err.message })
  }
}
