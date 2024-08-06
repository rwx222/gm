export async function GET() {
  const app_version = `${process.env.APP_VERSION}`
  const node_env = `${process.env.NODE_ENV}`

  return Response.json({ app_version, node_env })
}
