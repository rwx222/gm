'use server'
import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME } from '@/constants'
import { admin } from '@/data/firestore'

/**
 * Retrieves a custom token for the user based on the session cookie.
 *
 * @return {string|null} The custom token if the session cookie is valid, otherwise null.
 */
export default async function getCustomTokenAction() {
  try {
    const cookieStore = cookies()
    const sessionCookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionCookieValue) {
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookieValue, true)
      const customToken = await admin
        .auth()
        .createCustomToken(decodedClaims?.uid)

      return customToken
    }
  } catch (error) {
    console.error(error)
  }

  return null
}
