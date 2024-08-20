import { EVENT_REFRESH_AVATAR_DATA } from '@/constants'

export default function dispatchRefreshAvatarData() {
  window.dispatchEvent(new CustomEvent(EVENT_REFRESH_AVATAR_DATA))
}
