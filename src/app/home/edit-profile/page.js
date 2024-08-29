import { redirect } from 'next/navigation'
import { isValidNumber, isInteger } from 'ramda-adjunct'

import { PATH_AUTH } from '@/constants'
import EditProfile from '@/components/EditProfile/EditProfile'
import getSessionUserData from '@/data/getSessionUserData'
import getAllSkills from '@/data/getAllSkills'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Editar perfil',
}

export default async function EditProfilePage() {
  const userData = await getSessionUserData()

  if (!userData) {
    // the user is not logged in
    redirect(PATH_AUTH)
  }

  const skills = (await getAllSkills()) ?? []
  const skillsDefaultValues = {}

  skills.forEach((skill) => {
    const skillKey = skill?.key
    const rawValue = userData?.[skillKey] ?? 0
    const skillValue =
      isValidNumber(rawValue) &&
      isInteger(rawValue) &&
      rawValue >= 0 &&
      rawValue <= 100
        ? rawValue
        : 0

    skillsDefaultValues[skillKey] = skillValue
  })

  return (
    <main className='px-5'>
      <EditProfile
        userData={userData}
        skills={skills}
        skillsDefaultValues={skillsDefaultValues}
      />
    </main>
  )
}
