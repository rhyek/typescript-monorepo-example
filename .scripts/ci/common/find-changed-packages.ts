import fs from 'fs';
import path from 'path';
import execa from 'execa';
import tempy from 'tempy';
import {
  readProjects,
  filterPkgsBySelectorObjects,
  PackageGraph,
  PackageSelector,
} from '@pnpm/filter-workspace-packages';
import { Project } from '@pnpm/find-workspace-packages';
import { findWorkspaceDir } from './pnpm-helpers';
import { lockfileName } from './consts';
import { makeDedicatedLockfileForPackage } from './dedicated-lockfile';

export type Selector = PackageSelector & {
  diffExclusions?: RegExp[];
};

export function isCI() {
  return process.env.CI === 'true';
}

function changedBasedOnDiffFiles(
  packageBaseDir: string,
  diffFiles: string[],
  diffExclusions: RegExp[],
) {
  for (const diffFile of diffFiles) {
    if (
      diffFile.startsWith(packageBaseDir) &&
      diffExclusions.every((reg) => !reg.exec(diffFile))
    ) {
      return true;
    }
  }
  return false;
}

async function changedBasedOnLockfileDiff(
  workspaceDir: string,
  refLockfileDir: string,
  packageName: string,
) {
  const current = await makeDedicatedLockfileForPackage(
    workspaceDir,
    packageName,
    false,
  );
  const old = await makeDedicatedLockfileForPackage(
    refLockfileDir,
    packageName,
    false,
  );
  return current.content !== old.content;
}

async function filterProjects(
  workspaceDir: string,
  diffFiles: string[],
  refLockfileDir: string,
  selectors: Selector[],
) {
  const matchedPackages: PackageGraph<Project> = {};
  const { allProjects } = await readProjects(workspaceDir, []);
  for (const selector of selectors) {
    const {
      parentDir,
      diffExclusions = [],
      excludeSelf,
      includeDependencies,
      includeDependents,
    } = selector;
    let packages = await filterPkgsBySelectorObjects(
      allProjects,
      [{ parentDir }],
      { workspaceDir },
    );
    for (const [packageBaseDir, config] of Object.entries(
      packages.selectedProjectsGraph,
    )) {
      const packageName = config.package.manifest.name;
      if (!packageName) {
        throw new Error(`Package at ${packageBaseDir} is missing a name.`);
      }
      const changed =
        changedBasedOnDiffFiles(packageBaseDir, diffFiles, diffExclusions) ||
        (await changedBasedOnLockfileDiff(
          workspaceDir,
          refLockfileDir,
          packageName,
        ));
      if (changed) {
        const { selectedProjectsGraph } = await filterPkgsBySelectorObjects(
          allProjects,
          [
            {
              parentDir,
              namePattern: config.package.manifest.name,
              excludeSelf,
              includeDependencies,
              includeDependents,
            },
          ],
          { workspaceDir },
        );
        Object.assign(matchedPackages, selectedProjectsGraph);
      }
    }
  }
  return matchedPackages;
}

async function getTargetComparisonGitRef() {
  const commit = isCI()
    ? `origin/${process.env.GITHUB_BASE_REF}`
    : (await execa('git', ['rev-parse', 'HEAD'])).stdout; // get last commit on current branch

  if (!commit) {
    throw new Error('No ref to compare to.');
  }
  return commit;
}

async function getDiffFiles(comparisonRef: string, workspaceDir: string) {
  const { stdout } = await execa('git', ['diff', '--name-only', comparisonRef]);
  const files = stdout.split('\n').map((f) => path.resolve(workspaceDir, f));
  return files;
}

async function generateLockfileFromRef(ref: string) {
  const tempDir = tempy.directory();
  const { stdout } = await execa('git', ['show', `${ref}:${lockfileName}`]);
  const oldLockfilePath = path.resolve(tempDir, lockfileName);
  fs.writeFileSync(oldLockfilePath, stdout, { encoding: 'utf8' });
  return { content: stdout, dir: tempDir, path: oldLockfilePath };
}

Object.defineProperty(RegExp.prototype, 'toJSON', {
  value: RegExp.prototype.toString,
});

function logParams(selectors: Selector[], ref: string) {
  console.log('Finding changed packages with:');
  console.log('  Selectors:');
  for (const selector of selectors) {
    let i = 0;
    for (const [key, value] of Object.entries(selector)) {
      if (i === 0) {
        console.log(`    -  ${key}: ${value}`);
      } else {
        console.log(`       ${key}: ${value}`);
      }
      i++;
    }
  }
  console.log(`  Against ref: ${ref}`);
}

function logResult(result: PackageGraph<Project>) {
  console.log('Changed:');
  const nodes = Object.values(result);
  if (nodes.length > 0) {
    for (const node of nodes) {
      console.log(`  - ${node.package.manifest.name}`);
    }
  } else {
    console.log('  No changes.');
  }
}

export async function findChangedPackages(selectors: Selector[]) {
  const comparisonRef = await getTargetComparisonGitRef();
  logParams(selectors, comparisonRef);
  const workspaceDir = await findWorkspaceDir();
  const diffFiles = await getDiffFiles(comparisonRef, workspaceDir);
  const refLockfile = await generateLockfileFromRef(comparisonRef);
  const result = await filterProjects(
    workspaceDir,
    diffFiles,
    refLockfile.dir,
    selectors,
  );
  logResult(result);
  fs.rmSync(refLockfile.path);
  return result;
}
