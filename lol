SHA=$(curl -s \
  -H 'authorization: Bearer ${{ secrets.GITHUB_TOKEN }}'
  -H 'accept: application/vnd.github.groot-preview+json' \
  GET 'https://api.github.com/repos/rhyek/typescript-monorepo-example/commits/cae5994460e5d53ee36a2a63c9319a0ebf1039cd/pulls' \
  | jq -rM '.[0].head.sha' 2> /dev/null \
  || echo null
)