# https://stackoverflow.com/a/9894126/410224
trap "exit 1" TERM
export TOP_PID=$$

get_image_id () {
  local PACKAGE_NAME=$1
  local TAG=$2

  code=$(curl -s \
    --output out.txt \
    --write-out "%{http_code}" \
    -H "Authorization: Bearer $DOCKER_TOKEN" \
    -H 'Accept: application/vnd.github.v3+json' \
    "https://api.github.com/$PACKAGES_PATH_PREFIX/packages/container/$PACKAGE_NAME/versions"
  )
  if [ $code -eq 200 ]; then
    cat out.txt | jq -rM "first(.[] | select(.metadata.container.tags | index(\"$TAG\"))).id // null"
  else
    if [ $code -eq 404 ]; then
      echo 'null'
      return 0
    else
      cat out.txt
      kill -s TERM $TOP_PID
    fi
  fi
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
