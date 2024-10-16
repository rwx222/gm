import { NextResponse } from 'next/server'

import { admin } from '@/data/firestore'
import { ERROR_CODE_INTERNAL_SERVER } from '@/constants'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const idToken = authHeader.split('Bearer ')[1] ?? ''
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const { uid } = decodedToken
    await admin.auth().revokeRefreshTokens(uid)

    return new Response(JSON.stringify({ loggedOut: true }), { status: 200 })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        code: ERROR_CODE_INTERNAL_SERVER,
        message: ERROR_CODE_INTERNAL_SERVER,
      },
      { status: 500 },
    )
  }
}
