import admin from 'firebase-admin'

const saConfig = {
  type: process.env.FIRE_ADMIN_TYPE,
  project_id: process.env.FIRE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIRE_ADMIN_PRIVATE_KEY_ID,
  private_key: JSON.parse(process.env.FIRE_ADMIN_PRIVATE_KEY)?.value, // NOTE: -> check README.md for more info
  client_email: process.env.FIRE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIRE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIRE_ADMIN_AUTH_URI,
  token_uri: process.env.FIRE_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.FIRE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIRE_ADMIN_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIRE_ADMIN_UNIVERSE_DOMAIN,
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(saConfig) })
}

const db = admin.firestore()

export { admin, db }
