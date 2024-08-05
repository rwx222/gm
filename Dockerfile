# Stage 1
FROM node:20.16.0-alpine3.20 AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

RUN yarn install --production

# Stage 2
FROM node:20.16.0-alpine3.20
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["yarn", "start"]
