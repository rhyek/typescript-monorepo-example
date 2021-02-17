import execa from 'execa';
import { PackageGraph } from '@pnpm/filter-workspace-packages';
import { Project } from '@pnpm/find-workspace-packages';

export async function pnpmExec(
  command: string[],
  packages: PackageGraph<Project>,
) {
  const nodes = Object.values(packages);
  if (nodes.length > 0) {
    await execa(
      'pnpm',
      [
        'exec',
        '--parallel',
        '--parseable',
        ...nodes.map((n) => ['--filter', n.package.manifest.name!]),
        '--',
        ...command,
      ].flat(1),
      { stdio: 'inherit' },
    );
  }
}

export async function pnpmRun(
  command: string,
  packages: PackageGraph<Project>,
) {
  const nodes = Object.values(packages);
  if (nodes.length > 0) {
    await execa(
      'pnpm',
      [
        'run',
        command,
        '--parallel',
        '--parseable',
        ...nodes.map((n) => ['--filter', n.package.manifest.name!]),
      ].flat(1),
      { stdio: 'inherit' },
    );
  }
}
