import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'

/**
 * Takes a string and returns its obfuscated form as a Base64 string.
 *
 * @param {string} text - The string to obfuscate.
 * @return {string} An obfuscated string.
 */
export function obfuscateText(text) {
  return Base64.stringify(Utf8.parse(text))
}

/**
 * Takes an obfuscated string (as a Base64 string) and returns the original unobfuscated string.
 *
 * @param {string} encodedText - The obfuscated string to deobfuscate.
 * @return {string} The original unobfuscated string.
 */
export function deobfuscateText(encodedText) {
  return Utf8.stringify(Base64.parse(encodedText))
}
