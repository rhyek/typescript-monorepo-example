import path from 'path';
import 'colors';
import execa from 'execa';
import findUp from 'find-up';
import { getDirWithoutWorkspaceRootForDir } from './app-name-utils';

async function run(
  command: string,
  appDirs: string[],
  args: string[],
  silent: boolean,
) {
  appDirs = await Promise.all(appDirs.map(getDirWithoutWorkspaceRootForDir));
  if (appDirs.length > 0) {
    const allArgs = [
      command,
      '--parallel',
      '--parseable',
      ...appDirs.map((appDir) => ['--filter', `{${appDir}}`]),
      ...args,
    ].flat(1);
    await execa('pnpm', allArgs, silent ? undefined : { stdio: 'inherit' });
  } else if (!silent) {
    console.log('No packages selected.'.blue.italic);
  }
}

export async function pnpmExec(
  command: string[],
  appDirs: string[],
  silent = false,
) {
  await run('exec', appDirs, ['--', ...command], silent);
}

export async function pnpmRun(
  command: string,
  appDirs: string[],
  silent = false,
) {
  await run('run', appDirs, [command], silent);
}

export async function findWorkspaceDir() {
  const workspaceFile = await findUp('pnpm-workspace.yaml');
  if (!workspaceFile) {
    throw new Error('pnpm-workspace.yaml file not found.');
  }
  return path.dirname(workspaceFile);
}
