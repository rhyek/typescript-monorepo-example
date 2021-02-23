#!/bin/sh
set -e
rm -rf ./.github/workflows/*
.github-src/process.ts
{ git diff-files --name-only; git ls-files --others --exclude-standard; } | grep .github/workflows/ | xargs --no-run-if-empty git add
