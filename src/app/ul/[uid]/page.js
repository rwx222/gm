import { notFound, redirect } from 'next/navigation'

import getUser from '@/data/getUser'
import { FN_PATH_USER_PAGE } from '@/constants'

export const dynamic = 'force-dynamic'

export default async function ULPage({ params }) {
  const userData = await getUser(params.uid)

  if (!userData) {
    notFound()
  }

  redirect(FN_PATH_USER_PAGE(userData?.username), 'replace')
}
