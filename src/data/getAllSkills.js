import { db } from '@/data/firestore'

/**
 * Retrieves all skills from the 'skills' collection in the DB.
 *
 * @return {Promise<Array<{
 *   uid: string,
 *   key: string,
 *   name: string,
 * }> | null>} An array of skill data objects, or null if an error occurs.
 */
export default async function getAllSkills() {
  try {
    const skillsQuerySnap = await db.collection('skills').get()
    const skillsData = skillsQuerySnap.docs.map((doc) => {
      const skillData = doc.data()

      return { ...skillData, uid: doc.id }
    })

    return skillsData
  } catch (error) {
    console.error(error)
  }
  return null
}
