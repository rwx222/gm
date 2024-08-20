'use server'
import { revalidatePath } from 'next/cache'

// rules for revalidation at:
// https://nextjs.org/docs/app/api-reference/functions/revalidatePath

/**
 * Revalidates the specified path with the given type.
 *
 * @param {string} path - The path to revalidate.
 * @param {string} [type=''] - Optional type of revalidation; can be `page` or `layout`.
 * @return {Promise<void>} A promise that resolves when the revalidation is complete.
 */
export default async function revalidatePathAction(path, type) {
  try {
    revalidatePath(path, type)
  } catch (error) {
    console.error(error)
  }
}
