# App Live Preview

Check the latest deployment preview at the following URL:

🔥🔥🔥 [gm12.netlify.app](https://gm12.netlify.app) 🔥🔥🔥

# Development Log

## NodeJS

- The `.node-version` file was created to define the `version of Node.js that Netlify uses` when deploying. Therefore, the `same version should be used locally` for development.

## Yarn

- Yarn should be used as the package manager to keep consistent versions.
- Use yarn classic version `1.x.x`.

## The local development URL is `https://localhost:3000` with `https`

Due to certain security limitations (and for greater ease and convenience), the local server is run over the `https` protocol to enable testing Google login on localhost.

- Everything is already configured in the `yarn dev` command; all you need to do is go to the URL `https://localhost:3000`.
- On `localhost`, you can only log in with `email and password` and `Google`, **NOT with Facebook**. This is because it works the same way as Google, so **only Google is configured to work on localhost**. If Google login works on localhost, Facebook login will also work in production.

## NextJS

- In the `next.config.mjs` file, the `reactStrictMode` variable is set to `false` to avoid double mounting of components on the first render, which occurs in development mode.

## Netlify

- This project uses `Netlify` for deployment.
- To manage environment variables during development, create a `.env.local` file. This file should not be committed to the repository.
- Check the `.env.local.example` file to see the necessary variables.
- For deployment in real environments, configure the environment variables directly on the Netlify website.

## User Sessions

- The user has 3 options to log in: with `email and password`, with `Google`, and with `Facebook`.
- The user must verify their email through a link we send them before they can log in.
- Although we use Firebase's `Web SDK` on the frontend for authentication, we immediately create [session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies) with Firebase's `Admin SDK` from the backend.
- For this reason, the session is not maintained on the frontend but in a `session cookie` that the backend validates on each request that requires authentication.
- Session cookies `last for 12 days`. After this period, they expire, and the user must log in again.
- If the user manually logs out on any device they are logged into, it will also close all other active sessions on other devices.

## CSRF token cookie validation

This site implements `CSRF token validation` via a cookie to ensure that sensitive API requests originate from the same website and not from other clients or third parties.

- The CSRF token cookie is included in `GET` requests, but it is only validated in `PUT` requests.
- Any `PUT` request made to the API **must contain the CSRF token**; otherwise, it will be ignored.
- For this reason, sensitive API requests, such as those related to the user session, are made using `PUT`.
- `POST` requests are not validated since they are used for Next.JS `server actions`.
- All these validations are implemented in the `middleware.js` file.

## Google reCAPTCHA

We use [reCaptcha v3](https://developers.google.com/recaptcha/docs/v3) to validate users and help mitigate and limit potential misuse. For this, in the `constants.js` file, there is a constant called `RECAPTCHA_MIN_SCORE`, which determines the minimum score a user must have to pass and approve the reCaptcha test.

## Modify FIRE_ADMIN_PRIVATE_KEY env variable

When generating a new Firebase `serviceAccount`, a small change must be made to the `FIRE_ADMIN_PRIVATE_KEY` variable before using it.

The content of this variable is multiline, and parsing it generates an error. Therefore, it must be saved as a JSON in itself (both in the `.env.local` file and on `Netlify`) in the following way: `{"value":"content"}`, where **content** is the value of the `private_key` provided by Firebase.

So, in our `.env.local` file, it would look like this:

```bash
FIRE_ADMIN_PRIVATE_KEY='{"value":"---ANY-CONTENT---"}'
```

## Modify the NEXT_PUBLIC_FIRE_AUTH_DOMAIN env variable

For this project, we are using `Google` and `Facebook` auth providers with the `signInWithRedirect()` method. We are following [best practices recommended](https://firebase.google.com/docs/auth/web/redirect-best-practices) by Firebase to ensure it works correctly on modern browsers across all devices.

- Let's assume the domain where we deploy our web app is `gm12.netlify.app`.
- For this, `we create a proxy` with a NextJS `rewrite` (and NOT `redirect`), to simulate **"serving"** the necessary resources for authentication on our domain `gm12.netlify.app`.
- The proxy for this is located in the `middleware.js` file.
- The `NEXT_PUBLIC_FIRE_AUTH_DOMAIN` environment variable must be modified to point to our domain `gm12.netlify.app`; both in `.env.local` and in `Netlify`.
- Finally, the `auth handler` URIs, **modified with our domain**, must be added to both [Google](https://console.cloud.google.com/apis/credentials) and [Facebook](https://developers.facebook.com/apps) as shown below, in order to enable login with each service.

### For Google provider

- Go to [Google Auth Provider](https://console.cloud.google.com/apis/credentials) settings page.
- OAuth 2.0 Client IDs (`click on the client`)
- Authorized redirect URIs

<img src="https://i.ibb.co/YZvRXY3/google-uris.png" alt="Google example" style="max-height: 500px;">

### For Facebook provider

- Go to [Facebook Auth Provider](https://developers.facebook.com/apps) settings page.
- `Select your app`
- Use cases
- Customize
- Settings
- Valid OAuth Redirect URIs

<img src="https://i.ibb.co/C5Fh3Fb/facebook-uris.png" alt="Facebook example" style="max-height: 500px;">
