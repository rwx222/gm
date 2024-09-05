import { db } from '@/data/firestore'
import normalizeForSearch from '@/utils/normalizeForSearch'
import getUsernameFromEmail from '@/utils/getUsernameFromEmail'

/**
 * Retrieves some public fields of all users data from the 'users' collection in the DB,
 * and formats them in a standardized object for searching.
 *
 * @return {Promise<Array<{
 *   uid: string,
 *   displayName: string
 *   username: string
 *   _s: string
 * }>> | null>} An array of user data objects, or null if an error occurs.
 */
export default async function getUsersToSearchData() {
  try {
    const usersQuerySnap = await db
      .collection('users')
      .orderBy('displayName')
      .get()
    const usersToSearch = usersQuerySnap.docs.map((doc) => {
      const userData = doc.data()
      const displayName = userData?.displayName ?? ''
      const username = userData?.username ?? ''
      const eu = getUsernameFromEmail(userData?.email)

      return {
        uid: doc.id,
        displayName,
        username,
        _s:
          normalizeForSearch(displayName) +
          ' ' +
          normalizeForSearch(eu) +
          ' ' +
          normalizeForSearch(username),
      }
    })

    return usersToSearch
  } catch (error) {
    console.error(error)
  }
  return null
}
