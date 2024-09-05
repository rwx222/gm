export const CSRF_TOKEN_NAME = 'uctsgrmfk'

export const SESSION_COOKIE_NAME = 'gmfbscn'

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// regex
export const REGEX_USER_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
export const REGEX_USER_USERNAME = /^[a-z0-9_-]+$/
export const REGEX_USER_PHONE = /^\+?[1-9]\d{1,14}$/
export const REGEX_SN_USERNAME = /^[^\s]*$/

// storage keys
export const SS_KEY_SAVED_USER_PROFILE = 'SS_KEY_SAVED_USER_PROFILE'
export const SS_KEY_SAVED_EVENT = 'SS_KEY_SAVED_EVENT'

// custom events
export const EVENT_REFRESH_AVATAR_DATA = 'CUSTOM_EVENT_REFRESH_AVATAR_DATA_KEY'
export const EVENT_SIGN_OUT_SIGNAL = 'CUSTOM_EVENT_SIGNING_OUT_SIGNAL_KEY'

// routes
export const PATH_AUTH = '/auth'
export const PATH_HOME = '/home'
export const PATH_FORGOT_PASSWORD = '/forgot-password'
export const PATH_CHANGE_THEME = '/home/change-theme'
export const PATH_EDIT_PROFILE = '/home/edit-profile'
export const PATH_CALENDAR = '/home/calendar'
export const PATH_CREATE_EVENT = '/home/create-event'
export const FN_PATH_EDIT_EVENT = (uid) => '/home/edit-event/' + uid
export const FN_PATH_EVENT_PAGE = (uid) => '/home/event/' + uid
export const FN_PATH_USER_PAGE = (username) => '/u/' + username

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

// social networks
export const SN_TIKTOK_USER_LINK = 'https://www.tiktok.com/@'
export const SN_TIKTOK_USER_LABEL = 'tiktok.com/@'

export const SN_INSTAGRAM_USER_LINK = 'https://www.instagram.com/'
export const SN_INSTAGRAM_USER_LABEL = 'instagram.com/'

export const SN_X_USER_LINK = 'https://x.com/'
export const SN_X_USER_LABEL = 'x.com/'

export const SN_SNAPCHAT_USER_LINK = 'https://www.snapchat.com/add/'
export const SN_SNAPCHAT_USER_LABEL = 'snapchat.com/add/'

export const SN_YOUTUBE_USER_LINK = 'https://www.youtube.com/@'
export const SN_YOUTUBE_USER_LABEL = 'youtube.com/@'

export const SN_FACEBOOK_USER_LINK = 'https://www.facebook.com/'
export const SN_FACEBOOK_USER_LABEL = 'facebook.com/'

// form fields
export const FIELD_EMAIL_MAX_LENGTH = 254
export const FIELD_NAME_MIN_LENGTH = 2
export const FIELD_NAME_MAX_LENGTH = 60
export const FIELD_PASSWORD_MIN_LENGTH = 8
export const FIELD_PASSWORD_MAX_LENGTH = 128
export const FIELD_USERNAME_MIN_LENGTH = 3
export const FIELD_USERNAME_MAX_LENGTH = 30
export const FIELD_PHONE_MIN_LENGTH = 6
export const FIELD_PHONE_MAX_LENGTH = 16
export const FIELD_SN_USERNAME_MAX_LENGTH = 100

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
