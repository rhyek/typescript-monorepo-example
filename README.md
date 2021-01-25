# TypeScript monorepo example

The perfect typescript monorepo.

## Features

- [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [tsc-watch](https://github.com/gilamran/tsc-watch)
- [pnpm](https://pnpm.js.org/)
- [ttypescript](https://github.com/cevek/ttypescript)
- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
- automatic build of dependencies defined as TS project references when running dev, etc
- incremental builds for faster dev rebuilds
- base tsconfig.json, .eslintrc.js, .prettierrc
- non-relative paths for all imports
- path alias replacement during compilation based on configured tsconfig paths using ttypescript, and [typescript-transform-paths](https://github.com/LeDDGroup/typescript-transform-paths)

## Getting Started

- clone the repo
- install pnpm globally
- run `pnpm install` in the workspace root
- run any of the scripts defined in the root package.json (dev, lint, etc)

---

You can review all the needed changes from the initial to final commit [here](https://github.com/rhyek/typescript-monorepo-example/compare/d5a703c9304376297fa39418e20255e8dd60cc90..25d56dbaf080e6e03d8fa69d64128462894d8179).
