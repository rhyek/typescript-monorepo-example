#!/bin/sh
pnpx ts-node ./.github/compile.ts
git diff-files --name-only | grep .github/workflows/ | xargs git add
