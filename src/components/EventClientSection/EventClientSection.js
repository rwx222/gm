'use client'
import { Suspense, useEffect, useMemo } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { isNonEmptyArray } from 'ramda-adjunct'

import { useStore } from '@/components/ClientTasks/ClientTasks'
import { FN_PATH_EDIT_EVENT, SS_KEY_SAVED_EVENT } from '@/constants'
import { deobfuscateTextToData } from '@/utils/obfuscation'

function BaseComponent({
  eventUid,
  ownerUid,
  eventJudgesUids,
  eventParticipantsUids,
  ojus,
  opus,
}) {
  const avatarData = useStore((state) => state.avatarData)
  const sessionUserUid = avatarData?.uid

  const currentSessionUserIsOwner = Boolean(
    sessionUserUid && sessionUserUid === ownerUid
  )

  const currentSessionUserIsJudge = Boolean(
    sessionUserUid && eventJudgesUids.includes(sessionUserUid)
  )

  const currentSessionUserIsParticipant = Boolean(
    sessionUserUid && eventParticipantsUids.includes(sessionUserUid)
  )

  const judgesUsers = useMemo(() => {
    let res = []
    try {
      const resArr = deobfuscateTextToData(ojus)
      if (isNonEmptyArray(resArr)) {
        res = resArr
      }
    } catch (error) {
      console.error(error)
      console.error(`💥> DSU '${error?.message}'`)
    }
    return res
  }, [ojus])

  const participantsUsers = useMemo(() => {
    let res = []
    try {
      const resArr = deobfuscateTextToData(opus)
      if (isNonEmptyArray(resArr)) {
        res = resArr
      }
    } catch (error) {
      console.error(error)
      console.error(`💥> DSU '${error?.message}'`)
    }
    return res
  }, [opus])

  useEffect(() => {
    const savedEventFlag = sessionStorage.getItem(SS_KEY_SAVED_EVENT)
    sessionStorage.removeItem(SS_KEY_SAVED_EVENT)

    if (savedEventFlag) {
      toast.success('Cambios guardados', {
        duration: 5000,
        className: '!bg-success !text-success-content',
        icon: '✅',
      })
    }
  }, [])

  return (
    <div>
      {currentSessionUserIsJudge && (
        <section className='pb-5 flex items-center justify-center'>
          <div className='bg-base-300 rounded-md px-4 py-2 text-center text-lg font-semibold text-primary'>
            {`Eres Juez en este evento.`}
          </div>
        </section>
      )}

      {currentSessionUserIsOwner && (
        <section className='pb-5'>
          <div className='bg-base-300 rounded-md px-4 py-2 max-w-md mx-auto'>
            <div className='divider divider-primary text-primary font-semibold'>
              {`Jueces`}
            </div>
            {isNonEmptyArray(judgesUsers) ? (
              <div>
                {judgesUsers.map((user) => {
                  return (
                    <div key={user?.uid} className='py-2'>
                      <div className='text-sm leading-4'>
                        <div>{user?.displayName}</div>
                        <div className='text-primary'>{user?.username}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='text-center'>{`Sin jueces`}</div>
            )}
          </div>
        </section>
      )}

      {(currentSessionUserIsOwner || currentSessionUserIsParticipant) && (
        <section className='pb-5'>
          <div className='bg-base-300 rounded-md px-4 py-2 max-w-md mx-auto'>
            <div className='divider divider-secondary text-secondary font-semibold'>
              {`Participantes`}
            </div>
            {isNonEmptyArray(participantsUsers) ? (
              <div>
                {participantsUsers.map((user) => {
                  return (
                    <div key={user?.uid} className='py-2'>
                      <div className='text-sm leading-4'>
                        <div>{user?.displayName}</div>
                        <div className='text-secondary'>{user?.username}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='text-center'>{`Sin participantes`}</div>
            )}
          </div>
        </section>
      )}

      {currentSessionUserIsOwner && (
        <section className='pb-3 text-center'>
          <Link
            href={FN_PATH_EDIT_EVENT(eventUid)}
            className='btn btn-neutral btn-wide text-lg font-medium'
          >
            {`Editar`}
          </Link>
        </section>
      )}
    </div>
  )
}

export default function EventClientSection(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
