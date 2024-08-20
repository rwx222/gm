import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME } from '@/constants'
import { admin, db } from '@/data/firestore'
import formatUserData from '@/utils/formatUserData'

/**
 * Retrieves current session user data from the DB, based on the session cookie.
 *
 * @param {boolean} checkRevoked - Whether to check if the session cookie was revoked.
 * @param {boolean} getCustomToken - Whether to get a custom token for the user.
 * @return {Promise<{
 *   uid: string,
 *   email: string,
 *   username: string,
 *   displayName: string | null,
 *   photoURL: string | null,
 *   phoneNumber: string | null
 * } | null>} User data object, or null if the session cookie is not valid or if an error occurs.
 */
export default async function getSessionUserData(
  checkRevoked = false,
  getCustomToken = false
) {
  try {
    const cookieStore = cookies()
    const sessionCookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionCookieValue) {
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookieValue, Boolean(checkRevoked))
      const uid = decodedClaims?.uid
      const userDocSnap = await db.collection('users').doc(uid).get()
      const userData = userDocSnap.data()

      let ct = null
      if (getCustomToken) {
        ct = await admin.auth().createCustomToken(uid)
      }

      return formatUserData(uid, userData, { ct })
    }
  } catch (error) {
    console.error(error)
  }
  return null
}
