import { db } from '@/data/firestore'
import formatUserData from '@/utils/formatUserData'

/**
 * Retrieves user data from the DB based on the provided username.
 *
 * @param {string} username - The username of the user.
 * @return {Promise<{
 *   uid: string,
 *   email: string,
 *   username: string,
 *   displayName: string | null,
 *   photoURL: string | null,
 *   phoneNumber: string | null
 * } | null>} A Promise that resolves to the user data if found, or null if not found.
 */
export default async function getUserDataFromUsername(username) {
  try {
    const usersQuerySnap = await db
      .collection('users')
      .where('username', '==', username)
      .get()
    const usersData = usersQuerySnap.docs.map((doc) => {
      const userData = doc.data()
      return formatUserData(doc.id, userData)
    })

    return usersData?.[0] ?? null
  } catch (error) {
    console.error(error)
  }
  return null
}
