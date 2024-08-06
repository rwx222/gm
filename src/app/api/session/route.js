import { NextResponse } from 'next/server'
import cookie from 'cookie'

import {
  IS_PRODUCTION,
  SERVER_ERROR_CODE,
  RECENT_SESSION_ERROR_CODE,
  SESSION_COOKIE_NAME,
} from '@/constants'
import { admin } from '@/data/firestore'

const FIVE_MINS_IN_SECS = 60 * 5
const TWELVE_DAYS_IN_SECS = 60 * 60 * 24 * 12
const TWELVE_DAYS_IN_MSECS = TWELVE_DAYS_IN_SECS * 1000

function getNowInSeconds() {
  const now = new Date()
  return Math.floor(now.getTime() / 1000)
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const idToken = authHeader.split('Bearer ')[1] ?? ''
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const { auth_time, uid } = decodedToken
    const nowInSeconds = getNowInSeconds()
    const sessionElapsedTimeSecs = nowInSeconds - auth_time

    if (sessionElapsedTimeSecs > FIVE_MINS_IN_SECS) {
      return NextResponse.json(
        {
          code: RECENT_SESSION_ERROR_CODE,
          message: 'Recent sign in required',
        },
        { status: 401 }
      )
    }

    const sessionCookieValue = await admin.auth().createSessionCookie(idToken, {
      expiresIn: TWELVE_DAYS_IN_MSECS,
    })

    return new Response(JSON.stringify({ uid }), {
      status: 200,
      headers: {
        'Set-Cookie': cookie.serialize(
          SESSION_COOKIE_NAME,
          sessionCookieValue,
          {
            sameSite: 'lax',
            priority: 'high',
            httpOnly: true,
            secure: IS_PRODUCTION,
            maxAge: TWELVE_DAYS_IN_SECS,
            path: '/',
          }
        ),
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        code: SERVER_ERROR_CODE,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
