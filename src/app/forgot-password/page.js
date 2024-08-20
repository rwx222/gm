import { redirect } from 'next/navigation'

import ChangePassword from '@/components/ChangePassword/ChangePassword'
import { PATH_HOME } from '@/constants'
import getSessionUserUid from '@/data/getSessionUserUid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Recuperar Contraseña',
  description:
    'Si olvidaste tu contraseña puedes recuperarla a traves de tu email.',
}

export default async function ForgotPasswordPage() {
  const res = await getSessionUserUid()
  const uid = res?.uid

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
