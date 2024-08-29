import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME } from '@/constants'
import { admin, db } from '@/data/firestore'
import formatUserData from '@/utils/formatUserData'

/**
 * Retrieves current session user data from the DB, based on the session cookie.
 *
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
 * } | null>} User data object, or null if the session cookie is not valid or if an error occurs.
 */
export default async function getSessionUserData() {
  try {
    const cookieStore = cookies()
    const sessionCookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionCookieValue) {
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookieValue, true)
      const uid = decodedClaims?.uid
      const userDocSnap = await db.collection('users').doc(uid).get()
      const userData = userDocSnap.data()

      return formatUserData(uid, userData)
    }
  } catch (error) {
    console.error(error)
  }
  return null
}
