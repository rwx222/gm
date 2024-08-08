import { isString } from 'ramda-adjunct'

/**
 * Replaces multiple consecutive whitespace characters with a single space and trims the string.
 *
 * @param {string} value - The value to be normalized.
 * @return {string} The normalized value.
 */
export default function normalizeSpaces(value) {
  if (isString(value)) {
    return value.replace(/\s+/g, ' ').trim()
  }
  return value
}
