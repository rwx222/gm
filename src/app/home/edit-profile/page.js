import { redirect } from 'next/navigation'

import EditProfile from '@/components/EditProfile/EditProfile'
import getSessionUserData from '@/data/getSessionUserData'
import { PATH_AUTH } from '@/constants'

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

  return (
    <main className='px-5'>
      <EditProfile userData={userData} />
    </main>
  )
}
