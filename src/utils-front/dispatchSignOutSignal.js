import { EVENT_SIGN_OUT_SIGNAL } from '@/constants'

export default function dispatchSignOutSignal() {
  window.dispatchEvent(new CustomEvent(EVENT_SIGN_OUT_SIGNAL))
}
