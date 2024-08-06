import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME } from '@/constants'
import { admin, db } from '@/data/firestore'

/**
 * Retrieves user data from the DB, based on the session cookie.
 *
 * @return {Promise<{
 *   uid: string,
 *   username: string,
 *   displayName: string,
 *   email: string,
 *   photoURL: string
 * } | null>} User data object, or null if the session cookie is not valid or if an error occurs.
 */
export default async function getUserData() {
  try {
    const cookieStore = cookies()
    const sessionCookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionCookieValue) {
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookieValue, true)
      const uid = decodedClaims?.uid
      const userDocRef = db.collection('users').doc(uid)
      const userDocSnap = await userDocRef.get()
      const userData = userDocSnap.data()

      return {
        uid,
        username: userData?.username,
        displayName: userData?.displayName,
        email: userData?.email,
        photoURL: userData?.photoURL,
      }
    }
  } catch (error) {
    console.error(error)
  }
  return null
}
