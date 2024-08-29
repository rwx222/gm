import { isNonEmptyString } from 'ramda-adjunct'

/**
 * Capitalizes the first letter of a given string if it is a non-empty string.
 * Otherwise, the given value is returned as is.
 *
 * @param {string} value - The string to capitalize.
 * @returns {string} The capitalized string.
 */
export default function capitalizeFirstLetter(value) {
  if (isNonEmptyString(value)) {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  return value
}
