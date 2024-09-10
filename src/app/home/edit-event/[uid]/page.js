import { redirect, notFound } from 'next/navigation'

import {
  PATH_AUTH,
  EVENT_ROLE_JUDGE,
  EVENT_ROLE_PARTICIPANT,
} from '@/constants'
import CreateEditEvent from '@/components/CreateEditEvent/CreateEditEvent'
import getSessionUserUid from '@/data/getSessionUserUid'
import getAllEventTypes from '@/data/getAllEventTypes'
import getEvent from '@/data/getEvent'
import getUsersToSearchData from '@/data/getUsersToSearchData'
import getEventUsers from '@/data/getEventUsers'
import { obfuscateDataToText } from '@/utils/obfuscation'

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
  const eventData = await getEvent(params.uid)

  if (sessionUserUid !== eventData?.ownerUid) {
    // only the owner of the event can edit it
    notFound()
  }

  const eventTypes = (await getAllEventTypes()) ?? []
  const availableUsers = (await getUsersToSearchData()) ?? []
  const eventUsers = (await getEventUsers(params.uid)) ?? []
  const obfuscatedAvailableUsersString = obfuscateDataToText(availableUsers)

  if (eventData?.eventType) {
    const existsEventType = eventTypes.some((type) => {
      return type.key === eventData?.eventType
    })

    if (!existsEventType) {
      eventData.eventType = ''
    }
  }

  const eventJudgesUids = eventUsers
    .filter((eventUser) => eventUser.role === EVENT_ROLE_JUDGE)
    .map((eventUser) => eventUser.userUid)

  const eventParticipantsUids = eventUsers
    .filter((eventUser) => eventUser.role === EVENT_ROLE_PARTICIPANT)
    .map((eventUser) => eventUser.userUid)

  return (
    <main className='p-5'>
      <CreateEditEvent
        userUid={sessionUserUid}
        eventTypes={eventTypes}
        oaus={obfuscatedAvailableUsersString}
        eventData={eventData}
        eventJudgesUids={eventJudgesUids}
        eventParticipantsUids={eventParticipantsUids}
      />
    </main>
  )
}
