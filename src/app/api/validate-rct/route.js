import { NextResponse } from 'next/server'

import {
  ERROR_CODE_INTERNAL_SERVER,
  RECAPTCHA_TOKEN_NAME,
  RECAPTCHA_SECRET_KEY,
} from '@/constants'

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

export async function PUT(request) {
  try {
    const recaptchaToken = request.headers.get(RECAPTCHA_TOKEN_NAME) ?? ''
    const validationRes = await fetch(RECAPTCHA_VERIFY_URL, {
      cache: 'no-store',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
    })
    const validationData = await validationRes.json()

    return new Response(JSON.stringify(validationData), { status: 200 })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        code: ERROR_CODE_INTERNAL_SERVER,
        message: ERROR_CODE_INTERNAL_SERVER,
      },
      { status: 500 }
    )
  }
}
