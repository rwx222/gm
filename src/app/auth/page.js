import { redirect } from 'next/navigation'

import SignInOrSignUp from '@/components/SignInOrSignUp/SignInOrSignUp'
import { AFTER_LOGIN_PATH } from '@/constants'
import getUserUid from '@/data/getUserUid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Ingresar',
  description: 'Para ingresar inicia sesión o crea una cuenta',
}

export default async function Auth() {
  const uid = await getUserUid()

  if (uid) {
    // the user is already logged in
    redirect(AFTER_LOGIN_PATH)
  }

  return (
    <main className='mx-auto max-w-lg p-5'>
      <SignInOrSignUp />
    </main>
  )
}
