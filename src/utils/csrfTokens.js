/**
 * NOTE: ->
 * This file must be compatible with the 'Edge runtime' and must NOT use NodeJs native modules.
 * This is because Next.js has this restriction on the 'middleware.js' file, where a function from this file will be imported.
 * For this reason, the '@edge-csrf/core' library, which is compatible with the Edge runtime, is used here instead of the 'csrf' library.
 * Restriction URL: https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime
 */
import {
  createSecret,
  utoa,
  createToken,
  verifyToken,
  atou,
} from '@edge-csrf/core'

/**
 * @typedef {Object} Config
 * @property {number} SALT_LENGTH - The length of the salt (between 1 and 255). Defaults to 8.
 * @property {number} SECRET_LENGTH - The length of the secret (between 1 and 255). Defaults to 18.
 */

/**
 * @type {Config}
 */
const CONFIG = {
  SALT_LENGTH: 27,
  SECRET_LENGTH: 51,
}

const secretUint8Array = createSecret(CONFIG.SECRET_LENGTH)

/**
 * Generates a CSRF token asynchronously.
 *
 * @return {Promise<string>} The generated CSRF token as a string.
 */
export async function generateCsrfToken() {
  const tokenUint8Arr = await createToken(secretUint8Array, CONFIG.SALT_LENGTH)
  const tokenStr = utoa(tokenUint8Arr)
  return tokenStr
}

/**
 * Verifies a CSRF token asynchronously.
 *
 * @param {string} token - The CSRF token to verify.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating whether the token is valid.
 */
export async function verifyCsrfToken(token) {
  const tokenUint8Arr = atou(token)
  const isValid = await verifyToken(tokenUint8Arr, secretUint8Array)
  return isValid
}
