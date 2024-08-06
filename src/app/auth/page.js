import { redirect } from 'next/navigation'

import SocialLoginButtons from '@/components/SocialLoginButtons/SocialLoginButtons'
import { AFTER_LOGIN_PATH } from '@/constants'
import getUserUid from '@/data/getUserUid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Iniciar sesión',
}

export default async function Auth() {
  const uid = await getUserUid()

  if (uid) {
    // the user is already logged in
    redirect(AFTER_LOGIN_PATH)
  }

  return (
    <main className='mx-auto max-w-lg px-5'>
      <header>
        <h1 className='py-5 font-bold text-2xl sm:text-3xl'>{`Ingresar`}</h1>
      </header>

      <section>
        <p>
          {`Para mayor seguridad, facilidad, y que no debas recordar contraseñas, puedes ingresar con tu cuenta de Google o Facebook.`}
        </p>
      </section>

      <SocialLoginButtons />
    </main>
  )
}
