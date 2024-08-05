# Development Log

## NodeJS

- The `.node-version` file was created to define the `version of Node.js that Netlify uses` when deploying. Therefore, the `same version should be used locally` for development.

## Yarn

- Yarn should be used as the package manager to keep consistent versions.
- Use yarn classic version `1.x.x`.

## NextJS

- In the `next.config.mjs` file, the `reactStrictMode` variable is set to `false` to avoid double mounting of components on the first render, which occurs in development mode.

## Netlify

- This project uses `Netlify` for deployment.
- To manage environment variables during development, create a `.env.local` file. This file should not be committed to the repository.
- Check the `.env.local.example` file to see the necessary variables.
- For deployment in real environments, configure the environment variables directly on the Netlify website.

## Modify FIRE_ADMIN_PRIVATE_KEY variable

When generating a new Firebase `serviceAccount`, a small change must be made to the `FIRE_ADMIN_PRIVATE_KEY` variable before using it.

The content of this variable is multiline, and parsing it generates an error. Therefore, it must be saved as a JSON in itself (both in the `.env.local` file and on `Netlify`) in the following way: `{"value":"content"}`, where **content** is the value of the `private_key` provided by Firebase.

So, in our `.env.local` file, it would look like this:

```bash
FIRE_ADMIN_PRIVATE_KEY='{"value":"---ANY-CONTENT---"}'
```
