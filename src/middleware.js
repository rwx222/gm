import { NextResponse } from 'next/server'

import {
  PATH_HOME,
  IS_PRODUCTION,
  CSRF_TOKEN_NAME,
  ERROR_CODE_INVALID_CSRF,
} from '@/constants'
import firebaseConfig from '@/data/firebaseConfig'
import { generateCsrfToken, verifyCsrfToken } from '@/utils/csrfTokens'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const responseNext = NextResponse.next()

  if (
    pathname.startsWith('/__/auth/') ||
    pathname.startsWith('/__/firebase/')
  ) {
    const baseUrl = `https://${firebaseConfig.projectId}.firebaseapp.com`
    return NextResponse.rewrite(new URL(pathname, baseUrl))
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(PATH_HOME, request.url))
  }

  if (request.method === 'PUT') {
    const invalidCsrfTokenResponse = NextResponse.json(
      { code: ERROR_CODE_INVALID_CSRF, message: ERROR_CODE_INVALID_CSRF },
      { status: 403 }
    )

    try {
      const csrfHeaderToken = request.headers.get(CSRF_TOKEN_NAME) ?? ''
      const isTokenValid = await verifyCsrfToken(csrfHeaderToken)
      if (!isTokenValid) {
        return invalidCsrfTokenResponse
      }
    } catch (error) {
      console.error(error)
      return invalidCsrfTokenResponse
    }
  } else {
    // if the CSRF token is not set, generate it and set it in the cookie
    if (request.method === 'GET' && !request.cookies.has(CSRF_TOKEN_NAME)) {
      try {
        const csrfToken = await generateCsrfToken()
        responseNext.cookies.set(CSRF_TOKEN_NAME, csrfToken, {
          sameSite: 'lax',
          httpOnly: false,
          secure: IS_PRODUCTION,
          maxAge: IS_PRODUCTION
            ? 60 * 90 // 90 minutes
            : 60 * 10, // 10 minutes
        })
      } catch (error) {
        console.error(error)
      }
    }
  }

  return responseNext
}

export const config = {
  matcher: [
    /*
      Match all request paths except for the ones starting with:
        - _next/static (static files)
        - _next/image (image optimization files)
        - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
