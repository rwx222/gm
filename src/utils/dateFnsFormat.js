import { format } from 'date-fns'
import es from 'date-fns/locale/es'

/**
 * Format a date according to the given format string.
 *
 * @function dateFnsFormat
 * @param {Date} date The date to format.
 * @param {string} formatStr The format string to use.
 * @returns {string} The formatted date string.
 */
export default function dateFnsFormat(date, formatStr) {
  return format(date, formatStr, {
    locale: es,
  })
}
