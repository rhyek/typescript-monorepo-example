SUT_CHANGED=$(.scripts/ci/needs-build.ts @my/web-api)
ANY_DEP_CHANGED=false
DEPS=@my/internal-api
echo "SUT needs build: $SUT_CHANGED"
IFS=',' read -ra DEP <<< "$DEPS"
for i in "${DEP[@]}"; do
  THIS_RESULT=$(.scripts/ci/needs-build.ts $i)
  echo "$i needs build: $THIS_RESULT"
  if [ "$THIS_RESULT" = "true" ]; then
    ANY_DEP_CHANGED=true
  fi
done
SHOULD_RUN=false
if [ "$SUT_CHANGED" = "true" ] || [ "$ANY_DEP_CHANGED" = "true" ]; then
  SHOULD_RUN=true
fi

echo "SHOULD_RUN: $SHOULD_RUN"
