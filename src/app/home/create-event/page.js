import { redirect } from 'next/navigation'

import { PATH_AUTH } from '@/constants'
import CreateEditEvent from '@/components/CreateEditEvent/CreateEditEvent'
import getSessionUserUid from '@/data/getSessionUserUid'
import getAllEventTypes from '@/data/getAllEventTypes'
import getUsersToSearchData from '@/data/getUsersToSearchData'
import { obfuscateDataToText } from '@/utils/obfuscation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Crear evento',
}

export default async function CreateEventPage() {
  const sessionUserUid = await getSessionUserUid()

  if (!sessionUserUid) {
    // the user is not logged in
    redirect(PATH_AUTH)
  }

  const eventTypes = (await getAllEventTypes()) ?? []
  const availableUsers = (await getUsersToSearchData()) ?? []
  const obfuscatedAvailableUsersString = obfuscateDataToText(availableUsers)

  return (
    <main className='p-5'>
      <CreateEditEvent
        userUid={sessionUserUid}
        eventTypes={eventTypes}
        oaus={obfuscatedAvailableUsersString}
      />
    </main>
  )
}
