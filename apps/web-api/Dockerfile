FROM node:14.15-buster-slim

RUN npm i -g pnpm

WORKDIR /monorepo
COPY package.json pnpm-*.yaml tsconfig.json ./
COPY src/lib/package.json /monorepo/src/lib/
COPY src/web-api/package.json /monorepo/src/web-api/
RUN pnpm i --frozen-lockfile --prod
COPY src/lib /monorepo/src/lib
COPY src/web-api /monorepo/src/web-api
WORKDIR /monorepo/src/web-api

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