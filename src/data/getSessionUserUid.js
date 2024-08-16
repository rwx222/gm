import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME } from '@/constants'
import { admin } from '@/data/firestore'

/**
 * Retrieves the current session user UID from the session cookie.
 *
 * Useful for quickly checking if the user is logged in.
 *
 * @return {Promise<string|null>} The user UID if session is valid, otherwise null.
 */
export default async function getSessionUserUid() {
  try {
    const cookieStore = cookies()
    const sessionCookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionCookieValue) {
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookieValue, true)
      return decodedClaims?.uid ?? null
    }
  } catch (error) {
    console.error(error)
  }
  return null
}
