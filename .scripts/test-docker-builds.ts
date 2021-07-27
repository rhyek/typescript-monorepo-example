#!/usr/bin/env ts-node-transpile-only
import fs from 'fs/promises';
import path from 'path';
import parseArgs from 'minimist';
import 'colors';
import { buildImage } from './build-image';
import { findPackages } from './common/find-packages';
import { findWorkspaceDir } from './common/pnpm-helpers';
import { needsBuild } from './needs-build';

export async function testDockerBuilds(options: {
  onlyChanged: boolean;
  debug?: boolean;
}) {
  const { onlyChanged, debug = false } = options;
  const workspaceRoot = await findWorkspaceDir();
  const apps = await findPackages([{ parentDir: `${workspaceRoot}/apps` }]);
  type Config = { name: string; dir: string; dockerfile: string };
  const configs: Config[] = (
    await Promise.all(
      apps.map(async (app) => {
        const dockerfile = path.resolve(app.dir, 'Dockerfile');
        if (
          (await fs.stat(dockerfile).catch(() => false)) &&
          (!onlyChanged || (await needsBuild(app.name)))
        ) {
          return {
            ...app,
            dockerfile,
          };
        }
        return false;
      }),
    )
  ).filter((r) => r !== false) as Config[];
  if (configs.length === 0) {
    console.log('No apps to test docker builds for.');
  } else {
    await Promise.all(
      configs.map(async (config) => {
        const { name } = config;
        await buildImage(name, { debug });
      }),
    );
  }
  console.log('✔️ Success!'.green);
}

if (require.main === module) {
  async function main() {
    const argv = parseArgs(process.argv.slice(2), { boolean: ['debug'] });
    const { debug } = argv;
    testDockerBuilds({ onlyChanged: false, debug });
  }
  main();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
