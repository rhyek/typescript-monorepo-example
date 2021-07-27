#!/usr/bin/env ts-node-transpile-only
import 'colors';
import execa from 'execa';
import parseArgs from 'minimist';
import { makeDedicationLockfile } from './make-dedicated-lockfile';
import { findWorkspaceDir } from './common/pnpm-helpers';
import { getDirForAppName } from './common/app-name-utils';

type BuildImageOptions = {
  push?: {
    repository: string;
    image: string;
    tag: string;
  } | null;
  pipeLogs?: boolean;
  debug?: boolean;
};

export async function buildImage(
  appName: string,
  options: BuildImageOptions = {},
) {
  const { push, debug, pipeLogs } = options;
  await makeDedicationLockfile(appName);
  try {
    console.log('🐳', 'Building docker image for'.blue, appName);
    const appPath = await getDirForAppName(appName);
    const workspaceRoot = await findWorkspaceDir();
    const args = [
      'buildx',
      'build',
      ...(push
        ? [
            `--cache-from=type=registry,ref=${push.repository}/${push.image}-cache:latest`,
            `--cache-from=type=registry,ref=${push.repository}/${push.image}-cache:${push.tag}`,
            `--cache-to=type=registry,ref=${push.repository}/${push.image}-cache:${push.tag}`,
          ]
        : []),
      '-t',
      push
        ? `${push.repository}/${push.image}:${push.tag}`
        : `test-docker-build-${appName}`,
      '-f',
      `${appPath}/Dockerfile`,
      push ? '--push' : '',
      workspaceRoot,
    ];
    if (debug) {
      console.debug('docker build args:', JSON.stringify(args, null, 2));
    }
    await execa('docker', args, { stdio: pipeLogs ? 'inherit' : 'ignore' });
    console.log('✔️ Sucessfully built image for'.green, appName);
  } catch (error) {
    console.error('\n❌ Build for'.red, appName.bold, 'failed.'.red);
    throw error;
  }
}

if (require.main === module) {
  async function main() {
    const argv = parseArgs(process.argv.slice(2), { boolean: ['debug'] });
    const [appName] = argv._;
    const { repository, image, tag, debug } = argv;
    let push: BuildImageOptions['push'] = {
      repository,
      image,
      tag,
    };
    // check if some push options are specified
    if (Object.values(push).some((v) => typeof v !== 'undefined')) {
      // ensure all push options are specified
      if (!Object.values(push).every((v) => typeof v !== 'undefined')) {
        throw new Error('All or no push options must be specified.');
      }
    }
    // if not then send null
    else {
      push = null;
    }
    await buildImage(appName, { push, debug, pipeLogs: true });
  }
  main();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
