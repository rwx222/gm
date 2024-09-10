import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'
import { type } from 'ramda'
import { isNonEmptyString } from 'ramda-adjunct'

/**
 * Obfuscate data to a Base64 encoded string.
 * @param {object | Array} data - The data to obfuscate.
 * @returns {string} The obfuscated data as a Base64 encoded string, or an empty string if an error occurs.
 */
export function obfuscateDataToText(data) {
  try {
    if (type(data) === 'Object' || type(data) === 'Array') {
      const dataJsonString = JSON.stringify(data)
      const encodedText = Base64.stringify(Utf8.parse(dataJsonString))

      return encodedText
    }
  } catch (error) {
    console.error(error)
    console.error(`💥> OBD '${error?.message}'`)
  }
  return ''
}

/**
 * Deobfuscate a Base64 encoded string to its original data.
 * @param {string} encodedText - The Base64 encoded string to deobfuscate.
 * @returns {object | Array | null} The deobfuscated data, or null if an error occurs.
 */
export function deobfuscateTextToData(encodedText) {
  try {
    if (isNonEmptyString(encodedText)) {
      const dataJsonString = Utf8.stringify(Base64.parse(encodedText))
      const data = JSON.parse(dataJsonString)

      return data
    }
  } catch (error) {
    console.error(error)
    console.error(`💥> DBD '${error?.message}'`)
  }

  return null
}
