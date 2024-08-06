import { redirect } from 'next/navigation'

import ChangeThemeOptions from '@/components/ChangeThemeOptions/ChangeThemeOptions'
import getUserUid from '@/data/getUserUid'
import { AUTH_PATH } from '@/constants'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cambiar tema',
}

export default async function ChangeTheme() {
  const uid = await getUserUid()

  if (!uid) {
    // the user is not logged in
    redirect(AUTH_PATH)
  }

  return (
    <main className='px-5'>
      <section>
        <p>
          {`Por defecto tomamos el tema del sistema, pero puedes escoger otro. El que elijas se mostrará en este dispositivo.`}
        </p>
      </section>

      <ChangeThemeOptions />
    </main>
  )
}
