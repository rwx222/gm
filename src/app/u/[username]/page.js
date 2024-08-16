import { notFound } from 'next/navigation'

import getAllUsersData from '@/data/getAllUsersData'
import getUserDataFromUsername from '@/data/getUserDataFromUsername'

export const dynamic = 'force-static'

export const dynamicParams = true

export async function generateStaticParams() {
  const usersData = await getAllUsersData()
  return usersData.map((user) => ({ username: user.username }))
}

export async function generateMetadata({ params }) {
  const userData = await getUserDataFromUsername(params.username)

  if (!userData) {
    notFound()
  }

  return {
    title: `Perfil de ${userData?.displayName || params.username}`,
  }
}

export default async function U({ params }) {
  const userData = await getUserDataFromUsername(params.username)

  return (
    <main className='px-5'>
      <p>{`hello world: I'm: ${userData?.displayName}`}</p>
    </main>
  )
}
