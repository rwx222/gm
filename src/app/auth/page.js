import { redirect } from 'next/navigation'

import SignInOrSignUp from '@/components/SignInOrSignUp/SignInOrSignUp'
import { PATH_HOME } from '@/constants'
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
    redirect(PATH_HOME)
  }

  return (
    <main className='mx-auto max-w-lg p-5'>
      <SignInOrSignUp />
    </main>
  )
}
