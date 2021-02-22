import path from 'path';
import 'colors';
import execa from 'execa';
import findUp from 'find-up';

async function run(
  command: string,
  packageNames: string[],
  args: string[],
  silent: boolean,
) {
  if (packageNames.length > 0) {
    await execa(
      'pnpm',
      [
        command,
        '--parallel',
        '--parseable',
        ...packageNames.map((packageName) => ['--filter', packageName]),
        ...args,
      ].flat(1),
      silent ? undefined : { stdio: 'inherit' },
    );
  } else if (!silent) {
    console.log('No packages selected.'.blue.italic);
  }
}

export async function pnpmExec(
  command: string[],
  packageNames: string[],
  silent = false,
) {
  await run('exec', packageNames, ['--', ...command], silent);
}

export async function pnpmRun(
  command: string,
  packageNames: string[],
  silent = false,
) {
  await run('run', packageNames, [command], silent);
}

export async function findWorkspaceDir() {
  const workspaceFile = await findUp('pnpm-workspace.yaml');
  if (!workspaceFile) {
    throw new Error('pnpm-workspace.yaml file not found.');
  }
  return path.dirname(workspaceFile);
}
