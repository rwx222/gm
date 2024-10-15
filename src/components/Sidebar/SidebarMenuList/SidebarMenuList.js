'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, Suspense } from 'react'
import classNames from 'classnames'

import { PATH_HOME, PATH_CALENDAR } from '@/constants'
import { useStore } from '@/components/ClientTasks/ClientTasks'
import XIcon from '@/icons/XIcon'
import GripIcon from '@/icons/GripIcon'
import CalendarRangeIcon from '@/icons/CalendarRangeIcon'

function BaseComponent() {
  const pathname = usePathname()

  const toggleDrawer = useCallback(() => {
    const drawer = document.getElementById('main-layout-drawer')
    drawer.checked = !drawer.checked
  }, [])

  const avatarData = useStore((s) => s.avatarData)
  const userIsLoggedIn = Boolean(avatarData)

  return (
    <ul className='menu bg-base-200 text-base-content min-h-full w-80 p-4'>
      <li className='flex flex-row justify-end mb-3'>
        <label
          htmlFor='main-layout-drawer'
          className='btn btn-circle btn-ghost sm:hidden'
        >
          <XIcon width='36' height='36' />
        </label>
      </li>

      <li>
        <Link
          href={PATH_HOME}
          onClick={toggleDrawer}
          className={classNames('text-xl font-normal', {
            active: pathname === PATH_HOME,
          })}
        >
          <GripIcon width='20' height='20' />
          {`Inicio`}
        </Link>

        {userIsLoggedIn && (
          <Link
            href={PATH_CALENDAR}
            onClick={toggleDrawer}
            className={classNames('text-xl font-normal', {
              active: pathname === PATH_CALENDAR,
            })}
          >
            <CalendarRangeIcon width='20' height='20' />
            {`Mi Calendario`}
          </Link>
        )}
      </li>
    </ul>
  )
}

export default function SidebarMenuList(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
