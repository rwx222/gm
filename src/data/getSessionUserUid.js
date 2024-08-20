import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME } from '@/constants'
import { admin } from '@/data/firestore'

/**
 * Retrieves the current session user UID from the session cookie.
 *
 * Useful for quickly checking if the user is logged in.
 *
 * @param {boolean} checkRevoked - Whether to check if the session cookie was revoked.
 * @param {boolean} getCustomToken - Whether to get a custom token for the user.
 * @return {Promise<{
 *   uid: string | null,
 *   ct: string | null
 * }| null>} The user UID if session is valid, otherwise null.
 */
export default async function getSessionUserUid(
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
      const res = {
        uid: decodedClaims?.uid ?? null,
      }

      if (getCustomToken) {
        res.ct = await admin.auth().createCustomToken(res.uid)
      }

      return res
    }
  } catch (error) {
    console.error(error)
  }
  return null
}
