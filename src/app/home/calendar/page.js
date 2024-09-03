import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isNonEmptyArray } from 'ramda-adjunct'

import { PATH_AUTH, PATH_CREATE_EVENT, FN_PATH_EVENT_PAGE } from '@/constants'
import getSessionUserUid from '@/data/getSessionUserUid'
import getAllEvents from '@/data/getAllEvents'
import CalendarPlusIcon from '@/icons/CalendarPlusIcon'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Calendario',
}

export default async function CreateEventPage() {
  const sessionUserUid = await getSessionUserUid()

  if (!sessionUserUid) {
    // the user is not logged in
    redirect(PATH_AUTH)
  }

  const eventsData = await getAllEvents()

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
        {isNonEmptyArray(eventsData) ? (
          <div>
            {eventsData.map((event) => {
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
