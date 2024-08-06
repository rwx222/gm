'use server'
import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME } from '@/constants'
import { admin } from '@/data/firestore'

/**
 * Logs out a user by deleting the session cookie and revoking the user's refresh tokens.
 *
 * @param {string} userUid The unique identifier of the user to log out.
 * @return {Promise<void>} A promise that resolves when the user is successfully logged out.
 * @throws {Error} If there is an error deleting the session cookie or revoking the user's refresh tokens.
 */
export default async function logoutAction(userUid) {
  try {
    const cookieStore = cookies()
    const sessionCookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionCookieValue) {
      cookieStore.delete(SESSION_COOKIE_NAME)
      await admin.auth().revokeRefreshTokens(userUid)
    }
  } catch (error) {
    console.error(error)
  }
}
