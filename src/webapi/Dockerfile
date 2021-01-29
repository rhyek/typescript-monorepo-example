FROM node:14.15-buster-slim

RUN npm i -g pnpm

WORKDIR /monorepo
COPY package.json pnpm-*.yaml tsconfig.json ./
COPY src/lib /monorepo/src/lib
COPY src/webapi /monorepo/src/webapi
RUN pnpm i --frozen-lockfile --prod
WORKDIR /monorepo/src/webapi

RUN pnpm build

CMD ["pnpm", "start:prod"]

# in monorepo root
# docker build -t webapi:latest -f ./src/webapi/Dockerfile .
# docker run --rm -it \
#   -e PORT=3001 \
#   -e MSG=hi \
#   -p 3001:3001 \
#   webapi:latest
