import classNames from 'classnames'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isNonEmptyArray, isNonEmptyString, isOdd } from 'ramda-adjunct'
import { subHours } from 'date-fns'

import CalendarPlusIcon from '@/icons/CalendarPlusIcon'
import DotIcon from '@/icons/DotIcon'
import {
  PATH_AUTH,
  PATH_CREATE_EVENT,
  FN_PATH_EVENT_PAGE,
  DATEPICKER_DEFAULT_PROPS,
  EVENT_ROLE_JUDGE,
  EVENT_ROLE_PARTICIPANT,
} from '@/constants'
import getSessionUserUid from '@/data/getSessionUserUid'
import getUserEventsCalendar from '@/data/getUserEventsCalendar'
import getAllEventTypes from '@/data/getAllEventTypes'
import dateFnsFormat from '@/utils/dateFnsFormat'

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
  const recentEvents = userEvents
    .filter((event) => {
      return new Date(event?.startDateIsoString) >= minDateTime
    })
    .map((event) => {
      const _eventType = eventTypes.find(
        (type) => type.key === event?.eventType
      )
      return { ...event, _eventType }
    })

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
            <ul className='timeline timeline-snap-icon max-sm:timeline-compact timeline-vertical'>
              {recentEvents.map((event, eventIndex) => {
                return (
                  <li key={event?.uid}>
                    <div
                      className={classNames('timeline-middle', {
                        'text-secondary': event?.isPublished,
                        'text-warning': !event?.isPublished,
                      })}
                    >
                      <DotIcon width='20' height='20' />
                    </div>

                    <div
                      className={classNames('!mb-5', {
                        'timeline-end': isOdd(eventIndex),
                        'timeline-start sm:text-end': !isOdd(eventIndex),
                      })}
                    >
                      <time
                        className={classNames('text-lg capitalize', {
                          'text-secondary': event?.isPublished,
                          'text-warning': !event?.isPublished,
                        })}
                      >
                        {isNonEmptyString(event?.startDateIsoString)
                          ? dateFnsFormat(
                              new Date(event?.startDateIsoString),
                              DATEPICKER_DEFAULT_PROPS.dateFormat
                            )
                          : '---'}
                      </time>

                      {(event?._role === EVENT_ROLE_JUDGE ||
                        event?._role === EVENT_ROLE_PARTICIPANT) && (
                        <div>
                          <div
                            className={classNames(
                              'inline-block bg-base-300 rounded-md px-3 py-1 my-1 text-base',
                              {
                                'text-secondary': event?.isPublished,
                                'text-warning': !event?.isPublished,
                              }
                            )}
                          >
                            {event?._role === EVENT_ROLE_JUDGE && 'Eres Juez'}
                            {event?._role === EVENT_ROLE_PARTICIPANT &&
                              'Eres Participante'}
                          </div>
                        </div>
                      )}

                      <div
                        className={classNames('text-lg font-bold my-1', {
                          'text-accent': event?.isPublished,
                          'text-warning': !event?.isPublished,
                        })}
                      >
                        {event?.name && event?.uid ? (
                          <Link
                            href={FN_PATH_EVENT_PAGE(event?.uid)}
                            className='underline cursor-pointer'
                          >
                            {event?.name}
                          </Link>
                        ) : (
                          '---'
                        )}
                      </div>

                      <div
                        className={classNames('text-base', {
                          'text-primary': event?.isPublished,
                          'text-warning': !event?.isPublished,
                        })}
                      >
                        {event?._eventType?.name || '---'}
                      </div>

                      <div
                        className={classNames({
                          'text-warning': !event?.isPublished,
                        })}
                      >
                        {event?.description || '---'}
                      </div>
                    </div>

                    <hr
                      className={classNames({
                        'bg-secondary': event?.isPublished,
                        'bg-warning': !event?.isPublished,
                      })}
                    />
                  </li>
                )
              })}
            </ul>
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
