FROM node:14.15-buster-slim

RUN npm i -g pnpm

WORKDIR /monorepo
COPY package.json pnpm-*.yaml tsconfig.json ./
COPY src/lib/package.json /monorepo/src/lib/
COPY src/internal-api/package.json /monorepo/src/internal-api/
RUN pnpm i --frozen-lockfile --prod
COPY src/lib /monorepo/src/lib
COPY src/internal-api /monorepo/src/internal-api
WORKDIR /monorepo/src/internal-api

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