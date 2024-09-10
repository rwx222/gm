import { notFound } from 'next/navigation'
import Link from 'next/link'
import { isNonEmptyString } from 'ramda-adjunct'

import EventClientSection from '@/components/EventClientSection/EventClientSection'
import { EVENT_ROLE_JUDGE, EVENT_ROLE_PARTICIPANT } from '@/constants'
import { obfuscateDataToText } from '@/utils/obfuscation'
import getAllEvents from '@/data/getAllEvents'
import getAllEventTypes from '@/data/getAllEventTypes'
import getEvent from '@/data/getEvent'
import getUser from '@/data/getUser'
import getUsers from '@/data/getUsers'
import getEventUsers from '@/data/getEventUsers'

export const dynamic = 'force-static'

export const dynamicParams = true

export async function generateStaticParams() {
  const eventsData = await getAllEvents()
  return eventsData.map((event) => ({ uid: event.uid }))
}

export async function generateMetadata({ params }) {
  const eventData = await getEvent(params.uid)

  return {
    title: eventData?.name || 'Evento',
  }
}

export default async function EventPage({ params }) {
  const eventData = await getEvent(params.uid)

  if (!eventData) {
    notFound()
  }

  const ownerData = await getUser(eventData?.ownerUid)
  const eventTypes = (await getAllEventTypes()) ?? []
  const eventType = eventTypes.find((type) => type.key === eventData?.eventType)
  const eventUsers = (await getEventUsers(params.uid)) ?? []

  const eventJudgesUids = eventUsers
    .filter((eventUser) => eventUser.role === EVENT_ROLE_JUDGE)
    .map((eventUser) => eventUser.userUid)

  const eventParticipantsUids = eventUsers
    .filter((eventUser) => eventUser.role === EVENT_ROLE_PARTICIPANT)
    .map((eventUser) => eventUser.userUid)

  const judgesUsers = (await getUsers(eventJudgesUids)) ?? []
  const participantsUsers = (await getUsers(eventParticipantsUids)) ?? []

  const obfuscatedJudgesUsersString = obfuscateDataToText(judgesUsers)
  const obfuscatedParticipantsUsersString =
    obfuscateDataToText(participantsUsers)

  return (
    <main className='p-5'>
      {!eventData?.isPublished && (
        <section className='pb-5'>
          <div role='alert' className='alert alert-warning'>
            {`🔥`}
            <span className='text-lg font-medium'>{`Este Evento Ha Sido Pausado`}</span>
          </div>
        </section>
      )}

      {isNonEmptyString(eventData?.bannerUrl) && (
        <section className='pb-5'>
          <img
            src={eventData?.bannerUrl}
            alt='Event banner image'
            className='mx-auto max-h-[300px] rounded-md'
          />
        </section>
      )}

      <header className='pb-3'>
        <h1 className='text-xl sm:text-3xl font-semibold text-center text-accent'>
          {eventData?.name}
        </h1>

        <p className='text-center text-accent text-lg sm:text-2xl font-medium'>
          {eventType?.name ?? '---'}
        </p>
      </header>

      {eventData?.description && (
        <section className='pb-5'>
          <p className='text-center text-lg font-normal'>
            {eventData?.description}
          </p>
        </section>
      )}

      {ownerData && (
        <section className='pb-5'>
          <div className='text-center text-accent text-base font-normal'>
            {`Creado por:`}

            <div>
              <Link
                prefetch={false}
                href={`/ul/${ownerData?.uid}`}
                className='font-semibold'
              >
                {ownerData?.displayName}
              </Link>
            </div>
          </div>
        </section>
      )}

      <EventClientSection
        eventUid={eventData?.uid}
        ownerUid={eventData?.ownerUid}
        eventJudgesUids={eventJudgesUids}
        eventParticipantsUids={eventParticipantsUids}
        ojus={obfuscatedJudgesUsersString}
        opus={obfuscatedParticipantsUsersString}
      />
    </main>
  )
}
