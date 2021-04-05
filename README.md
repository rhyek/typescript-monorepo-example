# TypeScript monorepo example

The perfect typescript monorepo.

## Features

- [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html)
- incremental builds for faster rebuilds during development
- [tsc-watch](https://github.com/gilamran/tsc-watch)
- [pnpm](https://pnpm.js.org/)
- [ttypescript](https://github.com/cevek/ttypescript)
- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
- automatic build of dependencies defined as TS project references when running dev, etc
- automatic import suggestions in vscode for symbols within the current project or a referenced one (_does not require building dependencies for intellisense to reflect current changes!_)
- base tsconfig.json, jest.config.js, .eslintrc.js, .prettierrc
- non-relative paths for all imports
- path alias replacement during compilation based on configured tsconfig paths using ttypescript, and [typescript-transform-paths](https://github.com/LeDDGroup/typescript-transform-paths)

### Bonus

- Integration tests per SUT (system under test) each with its own docker-compose definition for dependencies (external or internal)
- Includes CI/CD pipelines for Github Actions (currently deploying to Heroku)
- Docker images built using multi-stage
- Docker images built for integration tests are also used for production

## Getting Started

- clone the repo
- install pnpm globally
- run `pnpm install` in the workspace root
- run any of the scripts defined in the root package.json (dev, lint, etc)

---

You can review all the needed changes from the initial to final commit [here](https://github.com/rhyek/typescript-monorepo-example/compare/d5a703c9304376297fa39418e20255e8dd60cc90..7e732e7179ad82066f8e5655bd35babc38764a2c).
