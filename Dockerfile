FROM node:lts-alpine3.19 as builder
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:lts-alpine3.19
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY ./static ./static
EXPOSE 8080
EXPOSE 8081
CMD ["npx", "nodemon", "./dist/src/index.js", "--queueTime", "10"]
