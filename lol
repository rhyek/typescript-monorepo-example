PACKAGE_NAME=typescript-monorepo-example-main-internal-api
IMAGE_ID=$(curl -s \
  -H 'Authorization: Bearer 9567147cec5e1a692e5e3e61256c241b58c451fd' \
  -H 'Accept: application/vnd.github.v3+json' \
  "https://api.github.com/user/packages/container/$PACKAGE_NAME/versions" \
  | jq '.[] | select(.metadata.container.tags | index("22")).id' 2> /dev/null \
  || echo null
)
echo $IMAGE_ID
if [ "$IMAGE_ID" != 'null' ]; then
  echo "Image id $IMAGE_ID with tag 22 deleted"
else
  echo "Image id not found"
fi
