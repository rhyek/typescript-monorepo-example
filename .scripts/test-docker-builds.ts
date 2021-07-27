#!/usr/bin/env ts-node-transpile-only
import path from 'path';
import fs from 'fs/promises';
import 'colors';
import { findPackages } from './common/find-packages';
import { findWorkspaceDir } from './common/pnpm-helpers';
import { needsBuild } from './needs-build';
import { buildImage } from './build-image';

export async function testDockerBuilds(onlyChanged: boolean) {
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
        const { name: packageName } = config;
        await buildImage(packageName);
      }),
    );
  }
  console.log('✔️ Success!'.green);
}

if (require.main === module) {
  testDockerBuilds(false);

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
