import { db } from '@/data/firestore'

/**
 * Retrieves all events data from the 'events' collection in the DB.
 *
 * @return {Promise<Array<{
 *   uid: string
 *   name: string
 *   startDateIsoString: string
 *   startDate: object
 *   eventType: string
 *   bannerUrl: string | null
 *   description: string | null
 *   isPublished: boolean
 *   ownerUid: string
 * }> | null>} An array of event data objects, or null if an error occurs.
 */
export default async function getAllEvents() {
  try {
    const eventsQuerySnap = await db.collection('events').get()
    const eventsData = eventsQuerySnap.docs.map((doc) => {
      const eventData = doc.data()
      return {
        ...eventData,
        uid: doc.id,
      }
    })

    return eventsData
  } catch (error) {
    console.error(error)
  }
  return null
}
