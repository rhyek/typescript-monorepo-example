#!/usr/bin/env ts-node-transpile-only
import 'colors';
import parseArgs from 'minimist';
import { needsBuild } from '../needs-build';
import { remoteImageExists } from './remote-image-exists';

export async function ciNeedsBuild(
  appName: string,
  repository: string,
  image: string,
) {
  if (
    (await needsBuild(appName)) ||
    !(await remoteImageExists(repository, image, 'latest'))
  ) {
    return true;
  }
  return false;
}

if (require.main === module) {
  async function main() {
    const argv = parseArgs(process.argv.slice(2));
    const [appName] = argv._;
    const { repository, image } = argv;
    console.log(
      (await ciNeedsBuild(appName, repository, image)) ? 'true' : 'false',
    );
  }
  main();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
