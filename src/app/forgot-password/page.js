import { redirect } from 'next/navigation'

import ChangePassword from '@/components/ChangePassword/ChangePassword'
import { PATH_HOME } from '@/constants'
import getUserUid from '@/data/getUserUid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Recuperar Contraseña',
  description:
    'Si olvidaste tu contraseña puedes recuperarla a traves de tu email.',
}

export default async function ForgotPassword() {
  const uid = await getUserUid()

  if (uid) {
    // the user is already logged in
    redirect(PATH_HOME)
  }

  return (
    <main className='mx-auto max-w-lg p-5'>
      <ChangePassword />
    </main>
  )
}
