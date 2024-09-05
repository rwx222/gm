import { redirect } from 'next/navigation'

import { PATH_AUTH } from '@/constants'
import CreateEditEvent from '@/components/CreateEditEvent/CreateEditEvent'
import getSessionUserUid from '@/data/getSessionUserUid'
import getAllEventTypes from '@/data/getAllEventTypes'
import getEvent from '@/data/getEvent'
import getUsersToSearchData from '@/data/getUsersToSearchData'
import { obfuscateText } from '@/utils/obfuscation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Editar evento',
}

export default async function EditEventPage({ params }) {
  const sessionUserUid = await getSessionUserUid()

  if (!sessionUserUid) {
    // the user is not logged in
    redirect(PATH_AUTH)
  }

  const eventTypes = (await getAllEventTypes()) ?? []
  const eventData = await getEvent(params.uid)
  const searchableUsers = (await getUsersToSearchData()) ?? []
  const obfuscatedSearchableUsersString = obfuscateText(
    JSON.stringify(searchableUsers)
  )

  if (eventData?.eventType) {
    const existsEventType = eventTypes.some((type) => {
      return type.key === eventData?.eventType
    })

    if (!existsEventType) {
      eventData.eventType = ''
    }
  }

  return (
    <main className='p-5'>
      <CreateEditEvent
        userUid={sessionUserUid}
        eventTypes={eventTypes}
        osus={obfuscatedSearchableUsersString}
        eventData={eventData}
      />
    </main>
  )
}
