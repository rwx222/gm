export const CSRF_TOKEN_NAME = 'uctsgrmfk'

export const SESSION_COOKIE_NAME = 'gmfbscn'

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const REGEX_USER_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

// routes
export const PATH_AUTH = '/auth'
export const PATH_HOME = '/home'
export const PATH_FORGOT_PASSWORD = '/forgot-password'
export const PATH_CHANGE_THEME = '/home/change-theme'

// form fields
export const FIELD_EMAIL_MAX_LENGTH = 254
export const FIELD_NAME_MAX_LENGTH = 60
export const FIELD_PASSWORD_MIN_LENGTH = 8
export const FIELD_PASSWORD_MAX_LENGTH = 128

// custom errors
export const ERROR_CODE_INVALID_CSRF = 'middleware/invalid-csrf-token'
export const ERROR_CODE_INTERNAL_SERVER = 'server/internal-server-error'
export const ERROR_CODE_RECENT_SESSION = 'session/recent-sign-in-required'
export const ERROR_CODE_ACCOUNT_EXISTS =
  'auth/account-exists-with-different-credential'
export const ERROR_CODE_EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use'
export const ERROR_CODE_INVALID_CREDENTIAL = 'auth/invalid-credential'
export const ERROR_CODE_POPUP_CLOSED = 'auth/popup-closed-by-user'
export const ERROR_CODE_TOO_MANY_REQUESTS = 'auth/too-many-requests'

// reCAPTCHA
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
export const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
export const ERROR_CODE_RECAPTCHA_LOW_SCORE = 'auth/recaptcha-low-score'
export const RECAPTCHA_TOKEN_NAME = 'vgrcth'
export const RECAPTCHA_SOCIAL_SIGN_IN_ACTION = 'auth_social_sign_in'
export const RECAPTCHA_SIGN_IN_ACTION = 'auth_sign_in'
export const RECAPTCHA_SIGN_UP_ACTION = 'auth_sign_up'
export const RECAPTCHA_FORGOT_PASSWORD = 'auth_forgot_password'
export const RECAPTCHA_MIN_SCORE = 0.6

// firebase auth providers ids
export const PROVIDER_ID_EMAIL_AND_PASSWORD = 'password'
export const PROVIDER_ID_GOOGLE = 'google.com'
export const PROVIDER_ID_FACEBOOK = 'facebook.com'
