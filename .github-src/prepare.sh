#!/bin/sh
pnpx ts-node ./.github-src/compile.ts
git diff-files --name-only | grep .github/workflows/ | xargs --no-run-if-empty git add
