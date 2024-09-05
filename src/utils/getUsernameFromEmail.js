import { isNonEmptyString } from 'ramda-adjunct'

/**
 * Retrieves the username from an email string.
 *
 * @param {string} email - The email to retrieve the username from.
 * @return {string} The username, or an empty string if the email is empty or null.
 */
export default function getUsernameFromEmail(email) {
  if (isNonEmptyString(email)) {
    return email.split('@')[0] ?? ''
  }
  return ''
}
