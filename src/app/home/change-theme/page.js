import { redirect } from 'next/navigation'

import ChangeThemeOptions from '@/components/ChangeThemeOptions/ChangeThemeOptions'
import getSessionUserUid from '@/data/getSessionUserUid'
import { PATH_AUTH } from '@/constants'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cambiar tema',
}

export default async function ChangeTheme() {
  const uid = await getSessionUserUid()

  if (!uid) {
    // the user is not logged in
    redirect(PATH_AUTH)
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
