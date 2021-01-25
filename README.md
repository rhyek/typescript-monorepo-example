# TypeScript monorepo example

## Features

- [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [tsc-watch](https://github.com/gilamran/tsc-watch)
- [pnpm](https://pnpm.js.org/)
- [ttypescript](https://github.com/cevek/ttypescript)
- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
- non-relative paths for all imports
- automatic build of dependencies defined as TS project references when running dev, etc
- incremental builds for faster dev rebuilds
- base tsconfig.json, .eslintrc.js, .prettierrc

## Getting Started

- clone the repo
- install pnpm globally
- run `pnpm install` in the workspace root
- run any of the scripts defined in the root package.json (dev, lint, etc)
