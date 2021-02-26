#!/bin/bash
set -e

for run in {1..4}; do
  docker system prune -af
  
  docker buildx rm mybuilder1

  docker buildx create --name mybuilder1 --driver docker-container

  docker buildx use mybuilder1

  docker buildx build \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --load \
    --cache-from=ghcr.io/rhyek/typescript-monorepo-example-main-web-api:rofl \
    -t ghcr.io/rhyek/typescript-monorepo-example-main-web-api:rofl \
    -f apps/web-api/Dockerfile \
    .

  docker run -it ghcr.io/rhyek/typescript-monorepo-example-main-web-api:rofl stat /monorepo/apps/web-api/dist/main.js

  docker push ghcr.io/rhyek/typescript-monorepo-example-main-web-api:rofl
done
