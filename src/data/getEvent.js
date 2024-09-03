import { db } from '@/data/firestore'

/**
 * Retrieves event data from the DB.
 *
 * @param {string} uid - The event UID.
 * @return {Promise<{
 *   uid: string
 *   name: string
 *   eventType: string
 *   bannerUrl: string | null
 *   description: string | null
 *   isPublished: boolean
 *   ownerUid: string
 * } | null>} A Promise that resolves to the event data if found, or null if not found.
 */
export default async function getEvent(uid) {
  try {
    const eventDocSnap = await db.collection('events').doc(uid).get()
    const eventData = eventDocSnap.data()

    if (eventData) {
      return {
        ...eventData,
        uid: eventDocSnap.id,
      }
    }
  } catch (error) {
    console.error(error)
  }
  return null
}
