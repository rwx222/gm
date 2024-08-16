import { db } from '@/data/firestore'
import formatUserData from '@/utils/formatUserData'

/**
 * Retrieves all user data from the 'users' collection in the DB.
 *
 * @return {Promise<Array<{
 *   uid: string,
 *   email: string,
 *   username: string,
 *   displayName: string | null,
 *   photoURL: string | null,
 *   phoneNumber: string | null
 * }> | null>} An array of user data objects, or null if an error occurs.
 */
export default async function getAllUsersData() {
  try {
    const usersQuerySnap = await db.collection('users').get()
    const usersData = usersQuerySnap.docs.map((doc) => {
      const userData = doc.data()
      return formatUserData(doc.id, userData)
    })

    return usersData
  } catch (error) {
    console.error(error)
  }
  return null
}
