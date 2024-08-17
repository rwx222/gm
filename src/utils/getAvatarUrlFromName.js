import { isNonEmptyString } from 'ramda-adjunct'

/**
 * Generates a URL for a user's avatar based on their name.
 *
 * @param {string} name - The user's name.
 * @return {string} The URL of the user's avatar.
 */
export default function getAvatarUrlFromName(name) {
  const nameUri = encodeURIComponent(
    isNonEmptyString(name) ? name : 'Anonymous'
  )

  return `https://ui-avatars.com/api/?background=09090b&color=dca54c&name=${nameUri}`
}
