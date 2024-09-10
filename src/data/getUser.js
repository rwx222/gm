import { db } from '@/data/firestore'
import formatUserData from '@/utils/formatUserData'

/**
 * Retrieves user data from the DB.
 *
 * @param {string} uid - The user ID of the user.
 * @return {Promise<{
 *   uid: string
 *   email: string
 *   username: string
 *   displayName: string | null
 *   photoURL: string | null
 *   phoneNumber: string | null
 *   snUserTiktok: string | null
 *   snUserInstagram: string | null
 *   snUserXcom: string | null
 *   snUserSnapchat: string | null
 *   snUserYoutube: string | null
 *   snUserFacebook: string | null
 * } | null>} User data object, or null if an error occurs.
 */
export default async function getUser(uid) {
  try {
    const userDocSnap = await db.collection('users').doc(uid).get()
    const userData = userDocSnap.data()

    if (userData) {
      return formatUserData(userDocSnap.id, userData)
    }
  } catch (error) {
    console.error(error)
  }
  return null
}
