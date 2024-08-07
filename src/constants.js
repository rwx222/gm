export const CSRF_TOKEN_NAME = 'uctsgrmfk'

export const SESSION_COOKIE_NAME = 'gmfbscn'

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const AUTH_PATH = '/auth'

export const AFTER_LOGIN_PATH = '/home'

// form fields
export const FIELD_EMAIL_MAX_LENGTH = 254
export const FIELD_NAME_MAX_LENGTH = 100
export const FIELD_PASSWORD_MIN_LENGTH = 8
export const FIELD_PASSWORD_MAX_LENGTH = 128

// custom errors
export const INVALID_CSRF_ERROR_CODE = 'middleware/invalid-csrf-token'
export const SERVER_ERROR_CODE = 'server/internal-server-error'
export const RECENT_SESSION_ERROR_CODE = 'session/recent-sign-in-required'
export const ACCOUNT_EXISTS_ERROR_CODE =
  'auth/account-exists-with-different-credential'
