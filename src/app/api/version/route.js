import { APP_VERSION, NODE_ENV } from '@/constants'

export async function GET() {
  const app_version = `${APP_VERSION}`
  const node_env = `${NODE_ENV}`

  return Response.json({ app_version, node_env })
}
