#!/bin/bash

set -e

export COMPOSE_PROJECT_NAME=web-api-e2e
# Disabled due to https://github.com/moby/buildkit/issues/1981
# TODO: BUILDKIT: re-enable after that issue is fixed
# export COMPOSE_DOCKER_CLI_BUILD=1
# export DOCKER_BUILDKIT=1
export INTERNAL_API_PORT=4001

WHICH=$([ "$CI" == "true" ] && echo 'ci' || echo 'dev')
docker-compose -f docker-compose.yaml -f "docker-compose.$WHICH.yaml" up --build --detach
sh -s -- "localhost:$INTERNAL_API_PORT" -t 30 -- echo "Internal API available at $INTERNAL_API_PORT." < <(curl -s https://raw.githubusercontent.com/eficode/wait-for/v1.2.0/wait-for)
# curl -i "localhost:$INTERNAL_API_PORT" || true
# echo
# docker-compose -f docker-compose.yaml -f "docker-compose.$WHICH.yaml" logs internal-api
ttsc -b ../tsconfig.test.json

jest --runInBand
