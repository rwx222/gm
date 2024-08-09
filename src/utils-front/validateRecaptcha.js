import {
  IS_PRODUCTION,
  CSRF_TOKEN_NAME,
  ERROR_CODE_RECAPTCHA_LOW_SCORE,
  RECAPTCHA_SITE_KEY,
  RECAPTCHA_TOKEN_NAME,
  RECAPTCHA_MIN_SCORE,
} from '@/constants'
import getCookie from '@/utils-front/getCookie'

/**
 * Validates a reCAPTCHA token.
 *
 * This function executes the reCAPTCHA validation, with an optional specified action name.
 *
 * The `actionName` must contain only letters and underscores, e.g. `valid_action_name`.
 *
 * @param {string} actionName - The action name for reCAPTCHA validation.
 * @return {Promise<void>} Resolves if the reCAPTCHA token is valid.
 *
 * @throws {Error} If the fetch request fails or the reCAPTCHA response is invalid.
 * @throws {Error} If the reCAPTCHA score is below the required minimum threshold.
 */
export default async function validateRecaptcha(actionName = 'nameless') {
  // recaptcha validation only on production
  if (IS_PRODUCTION) {
    const recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, {
      action: actionName,
    })
    const csrfToken = getCookie(CSRF_TOKEN_NAME)
    const recaptchaRes = await fetch('/api/validate-rct', {
      method: 'PUT',
      headers: {
        [CSRF_TOKEN_NAME]: csrfToken,
        [RECAPTCHA_TOKEN_NAME]: recaptchaToken,
      },
    })
    const recaptchaData = await recaptchaRes.json()

    if (!recaptchaRes.ok) {
      throw new Error(
        recaptchaData?.code || recaptchaData?.message || recaptchaRes.statusText
      )
    }

    if (!recaptchaData?.success || recaptchaData?.score < RECAPTCHA_MIN_SCORE) {
      throw new Error(ERROR_CODE_RECAPTCHA_LOW_SCORE)
    }
  }
}
