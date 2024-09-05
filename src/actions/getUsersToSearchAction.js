'use server'
import getUsersToSearchData from '@/data/getUsersToSearchData'

/**
 * Retrieves some public fields of all users data from the 'users' collection in the DB,
 * and formats them in a standardized object for searching.
 *
 * @return {Promise<Array<{
 *   uid: string,
 *   displayName: string
 *   username: string
 *   _s: string
 * }>> | null>} An array of user data objects, or null if an error occurs.
 */
export default async function getUsersToSearchAction() {
  try {
    const data = await getUsersToSearchData()
    return data
  } catch (error) {
    console.error(error)
  }

  return null
}
