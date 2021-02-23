SHA=$(curl -s \
  GET 'https://api.github.com/repos/rhyek/typescript-monorepo-example/commits/cae5994460e5d53ee36a2a63c9319a0ebf1039cd/pulls' \
  -H 'Accept: application/vnd.github.groot-preview+json' \
  | jq -rM '.[0].number' 2> /dev/null \
  || echo null
)
