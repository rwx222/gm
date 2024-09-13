import { FieldPath } from 'firebase-admin/firestore'

import { db } from '@/data/firestore'
import { EVENT_ROLE_OWNER } from '@/constants'

/**
 * Retrieves all events a user is participating in, ordered by start date descending.
 *
 * @param {string} userUid - The user UID.
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
 *   _role: string
 * }>> | null>} An array of event data objects, or null if an error occurs.
 */
export default async function getUserEventsCalendar(userUid) {
  try {
    const eventsUsersQuerySnap = await db
      .collection('events_users')
      .where('userUid', '==', userUid)
      .get()
    const eventRoleObj = {}
    const eventsUids = eventsUsersQuerySnap.docs.map((doc) => {
      const eventUserData = doc.data()
      const eventUid = eventUserData?.eventUid
      eventRoleObj[eventUid] = eventUserData?.role
      return eventUid
    })

    const eventsInvolvedQuerySnap = await db
      .collection('events')
      .where(FieldPath.documentId(), 'in', eventsUids)
      .get()
    const eventsInvolvedData = eventsInvolvedQuerySnap.docs.map((doc) => {
      const eventData = doc.data()
      const role = eventRoleObj[doc.id]
      return {
        ...eventData,
        uid: doc.id,
        _role: role,
      }
    })

    const eventsAsOwnerQuerySnap = await db
      .collection('events')
      .where('ownerUid', '==', userUid)
      .get()
    const eventsAsOwnerData = eventsAsOwnerQuerySnap.docs
      .filter((doc) => !eventsInvolvedData.some((e) => e.uid === doc.id))
      .map((doc) => {
        const eventData = doc.data()
        return {
          ...eventData,
          uid: doc.id,
          _role: EVENT_ROLE_OWNER,
        }
      })

    const eventsData = [...eventsInvolvedData, ...eventsAsOwnerData]

    eventsData.sort((a, b) => {
      return new Date(a.startDateIsoString) - new Date(b.startDateIsoString)
    })

    return eventsData
  } catch (error) {
    console.error(error)
  }
  return null
}
