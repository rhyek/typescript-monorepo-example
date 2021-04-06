FROM node:15-alpine as builder
# dependencies
RUN npm i -g pnpm
WORKDIR /monorepo
COPY pnpm-workspace.yaml ./
COPY apps/web-api/pnpm-lock.yaml ./pnpm-lock.yaml
COPY shared/lib/package.json shared/lib/
COPY apps/web-api/package.json apps/web-api/
RUN pnpm i --frozen-lockfile --prod
# build
COPY tsconfig.json ./
COPY shared/lib/tsconfig.json shared/lib/tsconfig.build.json shared/lib/
COPY shared/lib/src shared/lib/src
COPY apps/web-api/tsconfig.json apps/web-api/tsconfig.build.json apps/web-api/
COPY apps/web-api/src apps/web-api/src
WORKDIR /monorepo/apps/web-api
RUN pnpm build

FROM node:15-alpine
# prod dependencies
RUN npm i -g pnpm
WORKDIR /monorepo
COPY pnpm-workspace.yaml ./
COPY apps/web-api/pnpm-lock.yaml ./pnpm-lock.yaml
COPY shared/lib/package.json shared/lib/
COPY apps/web-api/package.json apps/web-api/
RUN pnpm i --frozen-lockfile --prod --no-optional
# copy build
COPY --from=builder /monorepo/shared/lib/dist shared/lib/dist
COPY --from=builder /monorepo/apps/web-api/dist apps/web-api/dist
WORKDIR /monorepo/apps/web-api
# run
CMD ["pnpm", "start:prod"]
