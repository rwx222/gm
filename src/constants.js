export const CSRF_TOKEN_NAME = 'uctsgrmfk'

export const SESSION_COOKIE_NAME = 'gmfbscn'

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const AUTH_PATH = '/auth'

export const AFTER_LOGIN_PATH = '/home'

// custom errors
export const INVALID_CSRF_ERROR_CODE = 'middleware/invalid-csrf-token'
export const SERVER_ERROR_CODE = 'server/internal-server-error'
export const RECENT_SESSION_ERROR_CODE = 'session/recent-sign-in-required'
