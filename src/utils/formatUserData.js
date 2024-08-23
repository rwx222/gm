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
 *   snUserTiktok: string | null
 *   snUserInstagram: string | null
 *   snUserXcom: string | null
 *   snUserSnapchat: string | null
 *   snUserYoutube: string | null
 *   snUserFacebook: string | null
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
    snUserTiktok: userData?.snUserTiktok,
    snUserInstagram: userData?.snUserInstagram,
    snUserXcom: userData?.snUserXcom,
    snUserSnapchat: userData?.snUserSnapchat,
    snUserYoutube: userData?.snUserYoutube,
    snUserFacebook: userData?.snUserFacebook,
  }
}
