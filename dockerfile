FROM node:lts-alpine3.19

COPY ./node_modules ./node_modules
COPY ./dist ./dist
COPY ./static ./static

ENTRYPOINT ["node", "./dist/src/index.js", "--queueTime", "10"]