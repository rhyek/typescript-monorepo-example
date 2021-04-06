get_image_id () {
  local PACKAGE_NAME=$1
  local TAG=$2

  curl -s \
    -H "Authorization: Bearer $DOCKER_TOKEN" \
    -H 'Accept: application/vnd.github.v3+json' \
    "https://api.github.com/$PACKAGES_PATH_PREFIX/packages/container/$PACKAGE_NAME/versions" \
    | jq -rM "first(.[] | select(.metadata.container.tags | index(\"$TAG\"))).id // null" \
    || echo null
}

delete_image () {
  local PACKAGE_NAME=$1
  local IMAGE_ID=$2

  curl -i \
    -X DELETE \
    -H "Authorization: Bearer $DOCKER_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/$PACKAGES_PATH_PREFIX/packages/container/$PACKAGE_NAME/versions/$IMAGE_ID"
}
