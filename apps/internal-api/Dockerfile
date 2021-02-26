FROM node:14-alpine

RUN npm i -g pnpm

WORKDIR /monorepo

COPY pnpm-*.yaml ./
COPY shared/lib/package.json /monorepo/shared/lib/
COPY apps/internal-api/package.json /monorepo/apps/internal-api/
RUN pnpm i --frozen-lockfile --prod

COPY tsconfig.json ./

COPY shared/lib/tsconfig.json shared/lib/tsconfig.build.json /monorepo/shared/lib/
COPY shared/lib/src /monorepo/shared/lib/src

COPY apps/internal-api/tsconfig.json apps/internal-api/tsconfig.build.json /monorepo/apps/internal-api/
COPY apps/internal-api/src /monorepo/apps/internal-api/src

WORKDIR /monorepo/apps/internal-api

RUN pnpm build

CMD ["pnpm", "start:prod"]

# in monorepo root
# docker build -t internal-api:latest -f ./src/internal-api/Dockerfile .
# docker build -t internal-api:latest -f ./Dockerfile ../../
# docker run --rm -it \
#   -e PORT=3001 \
#   -e MSG=hi \
#   -p 3001:3001 \
#   internal-api:latest


# DOCKER_BUILDKIT=1 docker build -t rhyek/typescript-monorepo-internal-api:latest -f ./src/internal-api/Dockerfile . --cache-from=rhyek/typescript-monorepo-internal-api:latest --build-arg BUILDKIT_INLINE_CACHE=1
# docker push rhyek/typescript-monorepo-internal-api:latest
# docker rmi rhyek/typescript-monorepo-internal-api:latest
