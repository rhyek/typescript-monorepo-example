#!/bin/bash
set -e

curl -i \
  -X DELETE \
  -H "Authorization: Bearer $DOCKER_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/user/packages/container/typescript-monorepo-example-main-web-api"

for run in {1..4}; do
  docker system prune -af
  
  docker buildx rm mybuilder1

  docker buildx create --name mybuilder1 --use

  OLD_PR_IMAGE_ID=$(curl -s \
    -H "Authorization: Bearer $DOCKER_TOKEN" \
    -H 'Accept: application/vnd.github.v3+json' \
    "https://api.github.com/user/packages/container/typescript-monorepo-example-main-web-api/versions" \
    | jq -rM 'first(.[] | select(.metadata.container.tags | index("rofl"))).id // null' 2> /dev/null \
    || echo null
  )

  docker buildx build \
    --cache-from=ghcr.io/rhyek/typescript-monorepo-example-main-web-api:rofl \
    --cache-to=type=inline \
    -t ghcr.io/rhyek/typescript-monorepo-example-main-web-api:rofl \
    -f apps/web-api/Dockerfile \
    --push \
    .

  # docker run -it ghcr.io/rhyek/typescript-monorepo-example-main-web-api:rofl stat /monorepo/apps/web-api/dist/main.js

  # docker push ghcr.io/rhyek/typescript-monorepo-example-main-web-api:rofl

  NEW_PR_IMAGE_ID=$(curl -s \
    -H "Authorization: Bearer $DOCKER_TOKEN" \
    -H 'Accept: application/vnd.github.v3+json' \
    "https://api.github.com/user/packages/container/typescript-monorepo-example-main-web-api/versions" \
    | jq -rM 'first(.[] | select(.metadata.container.tags | index("rofl"))).id // null' 2> /dev/null \
    || echo null
  )

  if [ "$OLD_PR_IMAGE_ID" != 'null' ] && [ "$OLD_PR_IMAGE_ID" != "$NEW_PR_IMAGE_ID" ]; then
    curl -i \
      -X DELETE \
      -H "Authorization: Bearer $DOCKER_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/user/packages/container/typescript-monorepo-example-main-web-api/versions/$OLD_PR_IMAGE_ID"
    echo "Deleted old PR image with id $OLD_PR_IMAGE_ID"
  fi
done
