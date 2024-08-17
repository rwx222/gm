/* eslint-disable @next/next/no-img-element */
import { notFound } from 'next/navigation'
import { isNonEmptyString } from 'ramda-adjunct'

import getAllUsersData from '@/data/getAllUsersData'
import getUserDataFromUsername from '@/data/getUserDataFromUsername'
import getAvatarUrlFromName from '@/utils/getAvatarUrlFromName'
import UserProfileEditSection from '@/components/UserProfileEditSection/UserProfileEditSection'

export const dynamic = 'force-static'

export const dynamicParams = true

export async function generateStaticParams() {
  const usersData = await getAllUsersData()
  return usersData.map((user) => ({ username: user.username }))
}

export async function generateMetadata({ params }) {
  const userData = await getUserDataFromUsername(params.username)

  return {
    title: `Perfil de ${userData?.displayName || params.username}`,
  }
}

export default async function U({ params }) {
  const userData = await getUserDataFromUsername(params.username)

  if (!userData) {
    notFound()
  }

  const avatarUrl = isNonEmptyString(userData?.photoURL)
    ? userData?.photoURL
    : getAvatarUrlFromName(userData?.displayName)

  return (
    <main className='px-5'>
      <section className='flex justify-center pb-5'>
        <div className='avatar'>
          <div className='ring-accent ring-offset-base-100 w-24 rounded-full ring ring-offset-2'>
            <img alt='Foto de usuario' src={avatarUrl} />
          </div>
        </div>
      </section>

      <section className='pb-3'>
        <h1 className='text-xl font-semibold text-center'>
          {userData?.displayName}
        </h1>
      </section>

      <UserProfileEditSection urlUsername={params.username} />

      <section className='pb-3'>
        <div className='w-full max-w-96 mx-auto'>
          <SkillItem value={85} className='progress-primary'>
            <SkillLabel className='text-primary'>Musicalidad: 85</SkillLabel>
          </SkillItem>

          <SkillItem value={40} className='progress-secondary'>
            <SkillLabel className='text-secondary'>Expresión: 40</SkillLabel>
          </SkillItem>

          <SkillItem value={95} className='progress-accent'>
            <SkillLabel className='text-accent'>Coreografía: 95</SkillLabel>
          </SkillItem>

          <SkillItem value={20}>
            <SkillLabel>Técnica: 20</SkillLabel>
          </SkillItem>

          <SkillItem value={55} className='progress-success'>
            <SkillLabel className='text-success'>Estilo: 55</SkillLabel>
          </SkillItem>

          <SkillItem value={100} className='progress-info'>
            <SkillLabel className='text-info'>Dificultad: 100</SkillLabel>
          </SkillItem>

          <SkillItem value={90} className='progress-warning'>
            <SkillLabel className='text-warning'>Presencia: 90</SkillLabel>
          </SkillItem>

          <SkillItem value={70} className='progress-error'>
            <SkillLabel className='text-error'>Sincronización: 70</SkillLabel>
          </SkillItem>
        </div>
      </section>
    </main>
  )
}

const SkillLabel = ({ children, className }) => {
  return (
    <div
      className={`mb-[-6px] text-base sm:text-lg leading-none sm:leading-none ${
        className ?? ''
      }`}
    >
      {children}
    </div>
  )
}

const SkillItem = ({ children, value, className }) => {
  return (
    <div className='pt-2'>
      {children}
      <progress
        value={value}
        max='100'
        className={`w-full progress ${className ?? ''}`}
      />
    </div>
  )
}
