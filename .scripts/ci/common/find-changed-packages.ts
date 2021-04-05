import fs from 'fs/promises';
import fsLegacy from 'fs';
import path from 'path';
import 'colors';
import execa from 'execa';
import mem from 'mem';
import tempy from 'tempy';
import {
  readProjects as slowReadProjects,
  filterPkgsBySelectorObjects,
  PackageGraph,
  PackageSelector,
} from '@pnpm/filter-workspace-packages';
import { Project } from '@pnpm/find-workspace-packages';
import { findWorkspaceDir } from './pnpm-helpers';
import { lockfileName } from './consts';
import { makeDedicatedLockfileForPackage } from './dedicated-lockfile';
import { debug } from './log';

export type Selector = PackageSelector & {
  diffInclude?: RegExp | RegExp[];
  diffExclude?: RegExp | RegExp[];
};

export function isCI() {
  return process.env.CI === 'true';
}

function changedBasedOnDiffFiles(
  packageBaseDir: string,
  diffFiles: string[],
  diffInclude: RegExp[],
  diffExclude: RegExp[],
) {
  for (const diffFile of diffFiles) {
    if (
      (!diffFile.includes('/') || diffFile.startsWith(packageBaseDir)) &&
      (diffInclude.length === 0 ||
        diffInclude.some((regex) => regex.exec(diffFile))) &&
      diffExclude.every((regex) => !regex.exec(diffFile))
    ) {
      return true;
    }
  }
  return false;
}

const changedBasedOnLockfileDiff = mem(
  async (workspaceDir: string, refLockfileDir: string, packageName: string) => {
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
    const changed =
      (current === null) !== (old === null) ||
      (current !== null && old !== null && current.content !== old.content);
    return changed;
  },
  { cacheKey: (args) => args.join(',') },
);

const readProjects = mem((workspaceDir: string) => {
  return slowReadProjects(workspaceDir, []);
});

async function filterProjects(
  workspaceDir: string,
  diffFiles: string[] | false,
  refLockfileDir: string | false,
  selectors: Selector[],
) {
  const matchedPackages: PackageGraph<Project> = {};
  const { allProjects } = await readProjects(workspaceDir);
  await Promise.all(
    selectors.map(async (selector) => {
      const {
        namePattern,
        parentDir,
        excludeSelf,
        includeDependencies,
        includeDependents,
      } = selector;
      let { diffInclude = [], diffExclude = [] } = selector;
      if (!Array.isArray(diffInclude)) {
        diffInclude = [diffInclude];
      }
      if (!Array.isArray(diffExclude)) {
        diffExclude = [diffExclude];
      }
      let packages = await filterPkgsBySelectorObjects(
        allProjects,
        [{ namePattern, parentDir }],
        { workspaceDir },
      );
      for (let [packageBaseDir, config] of Object.entries(
        packages.selectedProjectsGraph,
      )) {
        packageBaseDir = packageBaseDir.substr(workspaceDir.length + 1);
        const packageName = config.package.manifest.name;
        if (!packageName) {
          throw new Error(`Package at ${packageBaseDir} is missing a name.`);
        }
        const changed =
          (diffFiles === false
            ? false
            : changedBasedOnDiffFiles(
                packageBaseDir,
                diffFiles,
                diffInclude,
                diffExclude,
              )) ||
          (refLockfileDir === false
            ? false
            : await changedBasedOnLockfileDiff(
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
    }),
  );
  return matchedPackages;
}

const getTargetComparisonGitRef = mem(async () => {
  const commit = isCI()
    ? `origin/${process.env.GITHUB_BASE_REF}`
    : (await execa('git', ['rev-parse', 'HEAD'])).stdout; // get last commit on current branch

  if (!commit) {
    throw new Error('No ref to compare to.');
  }
  return commit;
});

const getDiffFiles = mem(async (comparisonRef: string) => {
  const { stdout } = await execa('git', ['diff', '--name-only', comparisonRef]);
  const files = stdout.split('\n');
  return files;
});

const generateLockfileFromRef = mem(async (ref: string) => {
  const tempDir = tempy.directory();
  const { stdout } = await execa('git', ['show', `${ref}:${lockfileName}`]);
  const oldLockfilePath = path.resolve(tempDir, lockfileName);
  await fs.writeFile(oldLockfilePath, stdout, { encoding: 'utf8' });
  process.on('exit', () => {
    fsLegacy.rmSync(oldLockfilePath);
  });
  return { content: stdout, dir: tempDir, path: oldLockfilePath };
});

Object.defineProperty(RegExp.prototype, 'toJSON', {
  value: RegExp.prototype.toString,
});

function logParams(selectors: Selector[], ref: string) {
  debug('Finding changed packages with:');
  debug('  Selectors:');
  for (const selector of selectors) {
    let i = 0;
    for (const [key, value] of Object.entries(selector)) {
      if (i === 0) {
        debug(`    -  ${key}: ${value}`);
      } else {
        debug(`       ${key}: ${value}`);
      }
      i++;
    }
  }
  debug(`  Against ref: ${ref}`);
}

function logResult(packageNames: string[]) {
  debug('Changed:');
  if (packageNames.length > 0) {
    for (const packageName of packageNames) {
      debug(`  - ${packageName}`);
    }
  } else {
    debug('  No changes.'.blue);
  }
}

export interface FindChangePackagesOptions {
  useDiffFiles?: boolean;
  diffFiles?: string[];
  useLockFile?: boolean;
  onlyPackages?: string[];
}

export async function findChangedPackages(
  selectors: Selector[],
  options?: FindChangePackagesOptions,
) {
  const comparisonRef = await getTargetComparisonGitRef();
  const {
    useDiffFiles = true,
    diffFiles = await getDiffFiles(comparisonRef),
    useLockFile = true,
    onlyPackages,
  } = options ?? {};
  logParams(selectors, comparisonRef);
  const workspaceDir = await findWorkspaceDir();
  const refLockfile = await generateLockfileFromRef(comparisonRef);
  const graph = await filterProjects(
    workspaceDir,
    useDiffFiles ? diffFiles : false,
    useLockFile ? refLockfile.dir : false,
    selectors,
  );
  const packageNames = Object.values(graph)
    .map((node) => node.package.manifest.name!)
    .filter(
      (packageName) =>
        typeof onlyPackages === 'undefined' ||
        onlyPackages.includes(packageName),
    );
  logResult(packageNames);
  return packageNames;
}
