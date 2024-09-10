import { db } from '@/data/firestore'

/**
 * Retrieves all event users data from the 'events_users' collection in the DB.
 *
 * @param {string} eventUid - The event UID.
 * @return {Promise<Array<{
 *   uid: string
 *   eventUid: string
 *   userUid: string
 *   role: string
 *   status: string | null
 * }>> | null>} An array of event users data objects, or null if an error occurs.
 */
export default async function getEventUsers(eventUid) {
  try {
    const eventUsersQuerySnap = await db
      .collection('events_users')
      .where('eventUid', '==', eventUid)
      .get()
    const eventsUsersData = eventUsersQuerySnap.docs.map((doc) => {
      const eventUserData = doc.data()
      return {
        ...eventUserData,
        uid: doc.id,
      }
    })

    return eventsUsersData
  } catch (error) {
    console.error(error)
  }
  return null
}
