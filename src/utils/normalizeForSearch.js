import { isNonEmptyString } from 'ramda-adjunct'

/**
 * Given a string, returns a new string that is suitable for searching.
 * It will be normalized to remove accents and other diacritics, lowercased,
 * whitespace will be collapsed to a single space, and trimmed.
 *
 * @param {string} str - The string to normalize.
 * @return {string} A normalized version of the string for searching.
 */
export default function normalizeForSearch(str) {
  if (isNonEmptyString(str)) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  }

  return ''
}
