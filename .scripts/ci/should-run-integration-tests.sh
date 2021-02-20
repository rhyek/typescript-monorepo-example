#!/bin/bash
SUT_CHANGED=$(.scripts/ci/needs-build.ts $SUT_PACKAGE_NAME)
echo "SUT needs build: $SUT_CHANGED"
ANY_DEP_CHANGED=false
if [ ! -z "$DEPS" ]; then # if not empty
  COMPOSE_FILE=$SUT_PATH/test/docker-compose.ci.yaml
  touch $COMPOSE_FILE
  echo 'services:' >> $COMPOSE_FILE
  IFS=',' read -ra ARR <<< "$DEPS"
  for DEP in "${ARR[@]}"; do
    IMAGE="ghcr.io/$GITHUB_REPOSITORY-$GITHUB_BASE_REF_SLUG-$DEP"
    docker manifest inspect $IMAGE:$GITHUB_SHA > /dev/null
    if [ $? == "0" ]; then
      DEP_CHANGED=true
      ANY_DEP_CHANGED=true
      TAG=$GITHUB_SHA
    else
      DEP_CHANGED=false
      TAG=latest
    fi
    echo "$DEP changed: $DEP_CHANGED"
    IMAGE_AND_TAG="$IMAGE:$TAG"
    echo "  $DEP:" >> $COMPOSE_FILE
    echo "    image: $IMAGE_AND_TAG" >> $COMPOSE_FILE
  done
  echo "$COMPOSE_FILE contents:"
  cat $COMPOSE_FILE
fi
SHOULD_RUN=false
if [ "$SUT_CHANGED" = "true" ] || [ "$ANY_DEP_CHANGED" = "true" ]; then
  SHOULD_RUN=true
fi
echo "should run: $SHOULD_RUN"
if [ "$SHOULD_RUN" = 'false' ]; then
  exit 1
fi
