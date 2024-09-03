import { db } from '@/data/firestore'

/**
 * Retrieves all event types from the 'event_types' collection in the DB.
 *
 * @return {Promise<Array<{
 *   uid: string,
 *   key: string,
 *   name: string,
 * }> | null>} An array of event types data objects, or null if an error occurs.
 */
export default async function getAllEventTypes() {
  try {
    const typesQuerySnap = await db.collection('event_types').get()
    const typesData = typesQuerySnap.docs.map((doc) => {
      const typeData = doc.data()

      return { ...typeData, uid: doc.id }
    })

    return typesData
  } catch (error) {
    console.error(error)
  }
  return null
}
