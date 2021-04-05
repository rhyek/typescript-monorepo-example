FROM node:15-alpine as builder
# dependencies
RUN npm i -g pnpm
WORKDIR /monorepo
COPY pnpm-workspace.yaml ./
COPY apps/internal-api/pnpm-lock.yaml ./pnpm-lock.yaml
COPY shared/lib/package.json shared/lib/
COPY apps/internal-api/package.json apps/internal-api/
RUN pnpm i --frozen-lockfile --prod
# build
COPY tsconfig.json ./
COPY shared/lib/tsconfig.json shared/lib/tsconfig.build.json shared/lib/
COPY shared/lib/src shared/lib/src
COPY apps/internal-api/tsconfig.json apps/internal-api/tsconfig.build.json apps/internal-api/
COPY apps/internal-api/src apps/internal-api/src
WORKDIR /monorepo/apps/internal-api
RUN pnpm build

FROM node:15-alpine
# prod dependencies
RUN npm i -g pnpm
WORKDIR /monorepo
COPY pnpm-workspace.yaml ./
COPY apps/internal-api/pnpm-lock.yaml ./pnpm-lock.yaml
COPY shared/lib/package.json shared/lib/
COPY apps/internal-api/package.json apps/internal-api/
RUN pnpm i --frozen-lockfile --prod --no-optional
# copy build
COPY --from=builder /monorepo/shared/lib/dist shared/lib/dist
COPY --from=builder /monorepo/apps/internal-api/dist apps/internal-api/dist
WORKDIR /monorepo/apps/internal-api
# run
CMD ["pnpm", "start:prod"]
