import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isNonEmptyArray } from 'ramda-adjunct'
import { subHours } from 'date-fns'

import CalendarPlusIcon from '@/icons/CalendarPlusIcon'
import { PATH_AUTH, PATH_CREATE_EVENT, FN_PATH_EVENT_PAGE } from '@/constants'
import getSessionUserUid from '@/data/getSessionUserUid'
import getUserEventsCalendar from '@/data/getUserEventsCalendar'
import getAllEventTypes from '@/data/getAllEventTypes'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mi Calendario',
}

export default async function CreateEventPage() {
  const sessionUserUid = await getSessionUserUid()

  if (!sessionUserUid) {
    // the user is not logged in
    redirect(PATH_AUTH)
  }

  const eventTypes = (await getAllEventTypes()) ?? []
  const userEvents = (await getUserEventsCalendar(sessionUserUid)) ?? []

  const minDateTime = subHours(new Date(), 25) // 25 hours ago
  const recentEvents = userEvents.filter((event) => {
    return new Date(event?.startDateIsoString) >= minDateTime
  })
  console.log(`🚀🚀🚀 -> userEvents:`, userEvents) // TODO: -> ltd

  return (
    <main className='px-5 pb-5 pt-1 xl:pt-5'>
      <div className='pb-3 flex justify-end'>
        <Link
          href={PATH_CREATE_EVENT}
          className='btn btn-secondary btn-sm text-lg'
        >
          <CalendarPlusIcon />
          {`Crear evento`}
        </Link>
      </div>

      <div className='py-5'>
        {isNonEmptyArray(recentEvents) ? (
          <div>
            {recentEvents.map((event) => {
              return (
                <div key={event.uid} className='pb-5'>
                  <Link
                    href={FN_PATH_EVENT_PAGE(event.uid)}
                    className='text-lg underline cursor-pointer'
                  >
                    {event.name}
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='text-center'>
            {`No tienes eventos en tu calendario.`}
          </div>
        )}
      </div>
    </main>
  )
}
