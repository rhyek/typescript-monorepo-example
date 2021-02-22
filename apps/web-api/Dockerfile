FROM node:14.15-alpine3.13

RUN npm i -g pnpm

WORKDIR /monorepo

# Generate dedicated-pnpm-lock.yaml using in root dir:
# pnpx ts-node -T .script/ci/make-dedicated-lockfile @my/web-api dedicated-pnpm-lock.yaml
COPY pnpm-*.yaml ./
COPY shared/lib/package.json /monorepo/shared/lib/
COPY apps/web-api/package.json /monorepo/apps/web-api/
RUN pnpm i --frozen-lockfile --prod

COPY tsconfig.json ./

COPY shared/lib/tsconfig.json shared/lib/tsconfig.build.json /monorepo/shared/lib/
COPY shared/lib/src /monorepo/shared/lib/src

COPY apps/web-api/tsconfig.json apps/web-api/tsconfig.build.json /monorepo/apps/web-api/
COPY apps/web-api/src /monorepo/apps/web-api/src

WORKDIR /monorepo/apps/web-api

RUN pnpm build

CMD ["pnpm", "start:prod"]

# in monorepo root
# docker build -t web-api:latest -f ./src/web-api/Dockerfile .
# docker build -t web-api:latest -f ./Dockerfile ../../
# docker run --rm -it \
#   -e PORT=3001 \
#   -e MSG=hi \
#   -p 3001:3001 \
#   web-api:latest


# DOCKER_BUILDKIT=1 docker build -t rhyek/typescript-monorepo-web-api:latest -f ./src/web-api/Dockerfile . --cache-from=rhyek/typescript-monorepo-web-api:latest --build-arg BUILDKIT_INLINE_CACHE=1
# docker push rhyek/typescript-monorepo-web-api:latest
# docker rmi rhyek/typescript-monorepo-web-api:latest

# yes