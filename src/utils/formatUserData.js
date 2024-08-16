/**
 * Formats user data by extracting relevant fields and returning them in a standardized object.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {object} userData - The raw user data object.
 * @return {{
 *   uid: string,
 *   email: string,
 *   username: string,
 *   displayName: string | null,
 *   photoURL: string | null,
 *   phoneNumber: string | null
 * }} A formatted user data object.
 */
export default function formatUserData(uid, userData) {
  return {
    uid,
    email: userData?.email,
    username: userData?.username,
    displayName: userData?.displayName,
    photoURL: userData?.photoURL,
    phoneNumber: userData?.phoneNumber,
  }
}
