import path from 'path';
import execa from 'execa';
import {
  readProjects,
  filterPkgsBySelectorObjects,
  PackageGraph,
  PackageSelector,
} from '@pnpm/filter-workspace-packages';
import { Project } from '@pnpm/find-workspace-packages';

export const isCI = process.env.CI === 'true';

export type Selector = PackageSelector & {
  diffExclusions?: RegExp[];
};

async function filterProjects(
  projects: Project[],
  diffFiles: string[],
  selectors: Selector[],
) {
  const matchedPackages: PackageGraph<Project> = {};
  for (const selector of selectors) {
    const {
      parentDir,
      diffExclusions = [],
      excludeSelf,
      includeDependencies,
      includeDependents,
    } = selector;
    let packages = await filterPkgsBySelectorObjects(
      projects,
      [{ parentDir }],
      { workspaceDir: process.cwd() },
    );
    const absoluteDiffFiles = diffFiles.map((f) =>
      path.resolve(process.cwd(), f),
    );
    for (const [packageBaseDir, config] of Object.entries(
      packages.selectedProjectsGraph,
    )) {
      for (const diffFile of absoluteDiffFiles) {
        if (
          diffFile.startsWith(packageBaseDir) &&
          diffExclusions.every((reg) => !reg.exec(diffFile))
        ) {
          const { selectedProjectsGraph } = await filterPkgsBySelectorObjects(
            projects,
            [
              {
                parentDir,
                namePattern: config.package.manifest.name,
                excludeSelf,
                includeDependencies,
                includeDependents,
              },
            ],
            { workspaceDir: process.cwd() },
          );
          Object.assign(matchedPackages, selectedProjectsGraph);
          break;
        }
      }
    }
  }
  return matchedPackages;
}

export async function findChangedPackages(selectors: Selector[]) {
  const { allProjects } = await readProjects(process.cwd(), []);
  const commit = isCI
    ? process.env.GITHUB_BASE_REF
    : (await execa('git', ['rev-parse', 'HEAD'])).stdout;
  if (!commit) {
    throw new Error('No commit to compare to.');
  }
  const { stdout: diffStdout } = await execa('git', [
    'diff',
    '--name-only',
    commit,
  ]);
  const result = await filterProjects(
    allProjects,
    diffStdout.split('\n'),
    selectors,
  );
  return result;
}
