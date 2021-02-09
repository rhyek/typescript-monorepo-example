#!/bin/sh
set -e
rm -rf ./.github/workflows/*
pnpx ts-node ./.github-src/compile.ts
{ git diff-files --name-only; git ls-files --others --exclude-standard; } | grep .github/workflows/ | xargs --no-run-if-empty git add
