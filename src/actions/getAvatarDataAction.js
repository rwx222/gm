'use server'
import { pick } from 'ramda'

import getSessionUserData from '@/data/getSessionUserData'

/**
 * Retrieves some public fields of the current session user data.
 *
 * @return {Promise<{
 *   uid: string,
 *   username: string,
 *   displayName: string | null,
 *   photoURL: string | null
 *   snUserTiktok: string | null
 *   snUserInstagram: string | null
 *   snUserXcom: string | null
 *   snUserSnapchat: string | null
 *   snUserYoutube: string | null
 *   snUserFacebook: string | null
 * } | null>} An object containing some user data; or null.
 */
export default async function getAvatarDataAction() {
  try {
    const rawUserData = await getSessionUserData()

    if (rawUserData) {
      const avatarUserData = pick(
        [
          'uid',
          'username',
          'displayName',
          'photoURL',
          'snUserTiktok',
          'snUserInstagram',
          'snUserXcom',
          'snUserSnapchat',
          'snUserYoutube',
          'snUserFacebook',
        ],
        rawUserData
      )
      return avatarUserData
    }
  } catch (error) {
    console.error(error)
  }

  return null
}
