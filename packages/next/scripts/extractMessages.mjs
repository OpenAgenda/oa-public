import path from 'node:path';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import ts from 'typescript';
import dedent from 'dedent';
import { globby } from 'globby';
import extract from '@openagenda/intl/scripts/extract';
import compile from '@openagenda/intl/scripts/compile';

const require = createRequire(import.meta.url);
const { DEFAULT_LANGS, DEFAULT_LANG } = require('@openagenda/intl/constants');

const root = new URL('..', import.meta.url).pathname;
const sources = [
  'next-env.d.ts',
  ...await globby('src/types/*.d.ts'),
  ...process.argv.slice(2),
];
const viewsDir = 'src/views';
const ignoredDirs = ['src/pages']; // Don't create locales

const configPath = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');
if (!configPath) {
  throw new Error("Could not find a valid 'tsconfig.json'.");
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const compilerOptions = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  root,
);

function isInDir(from, to) {
  return !path.relative(from, to).startsWith('..');
}

function isDirectSubDir(from, to) {
  const relativePath = path.relative(from, to);
  return (
    !relativePath.startsWith('..') && relativePath.split(path.sep).length === 1
  );
}

function isInPackage(filePath) {
  return isInDir(root, filePath);
}

function groupByDir(depsMap) {
  const depsByDir = new Map();

  for (const [pathname] of depsMap) {
    const directory = path.dirname(pathname);
    if (depsByDir.has(directory)) {
      depsByDir.get(directory).push(pathname);
    } else {
      depsByDir.set(directory, [pathname]);
    }
  }

  return depsByDir;
}

// function filesToGlob(directory, files) {
//   return `${directory}/{${files.map(v => path.basename(v)).join(',')}}`;
// }

function relativeToCwd(file) {
  return path.relative(process.cwd(), file);
}

function isIgnoredDir(directory) {
  return ignoredDirs.some(
    (ignoredDir) => !path.relative(ignoredDir, directory).startsWith('..'),
  );
}

async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

function collectDeps(depsMap, sourceFiles, viewDir) {
  const result = [...sourceFiles];

  for (const sourceFile of sourceFiles) {
    const deps = depsMap
      .get(sourceFile)
      // exclude deps from other views
      .filter(
        (dep) =>
          !viewDir || !(isInDir(viewsDir, dep) && !isInDir(viewDir, dep)),
      );

    if (deps?.length) {
      result.push(
        ...collectDeps(depsMap, deps).filter((v) => !result.includes(v)),
      );
    }
  }

  return result;
}

async function createIndex(localesRoot) {
  const indexPath = path.join(localesRoot, 'index.ts');

  /* eslint-disable no-template-curly-in-string */
  const content = `${dedent`
    // DOES NOT EDIT, generated file by 'oa-intl'

    /* eslint-disable */

    export default async function fetchLocale(locale) {
      return import(\`./compiled/${'${locale}'}.json\`)
        .then((mod) => mod.default)
        .catch((e) => {
          console.error(\`API: Failed to fetch locale ${'${locale}'}\`, e);
          return {};
        });
    }
    `}\n`;
  /* eslint-enable no-template-curly-in-string */

  console.log(`✔️ Create ${relativeToCwd(indexPath)}`);

  await fs.writeFile(indexPath, content);
}

async function createViewIndex(viewDir, deps, hasLocales) {
  const indexPath = path.join(viewDir, 'locales/index.ts');
  const relativeDeps = deps
    .map((dep) => path.relative(path.join(root, 'src'), dep))
    .sort();

  /* eslint-disable no-template-curly-in-string */
  const content = `${dedent`
    // DOES NOT EDIT, generated file by 'oa-intl'

    /* eslint-disable */

    ${relativeDeps
      .map((v, i) => `import fetchLocale${i} from '${v}';`)
      .join('\n    ')}${
      relativeDeps.length
        ? `
    
    `
        : ''
    }export default async function fetchLocale(locale) {
      return Promise.all([${
        hasLocales
          ? `
        import(\`./compiled/${'${locale}'}.json\`).then((mod) => mod.default),`
          : ''
      }${
        relativeDeps.length
          ? `
        `
          : ''
      }${relativeDeps
        .map((v, i) => `fetchLocale${i}(locale),`)
        .join('\n        ')}
      ])
        .then((results) => Object.assign({}, ...results))
        .catch((e) => {
          console.error(\`API: Failed to fetch locale ${'${locale}'}\`, e);
          return {};
        });
    }
    `}\n`;
  /* eslint-enable no-template-curly-in-string */

  console.log(`✔️ Create ${relativeToCwd(indexPath)}`);

  await fs.writeFile(indexPath, content);
}

/* Script */

const options = {
  ...compilerOptions.options,
  incremental: false,
  noEmit: true,
};
const compilerHost = ts.createCompilerHost(options);
const moduleResolutionCache = ts.createModuleResolutionCache(
  root,
  (fileName) => fileName,
  options,
);

// BFS through the package's import graph from the seed `sources`. We only
// need top-level imports/exports to find `defineMessages` files and their
// deps — so parsing each file with `ts.createSourceFile` (no binding, no
// type checker) is enough and avoids the multi-second cost of
// `ts.createProgram` for this codebase.
function discoverPackageFiles(roots) {
  const dependenciesMap = new Map();
  const dependentsMap = new Map();
  const visited = new Set();
  const queue = roots.map((r) => path.resolve(r));

  function isPackageNonLocaleSource(filePath) {
    return (
      isInPackage(filePath) &&
      !filePath.endsWith('.d.ts') &&
      !filePath.endsWith('/locales/index.ts')
    );
  }

  while (queue.length > 0) {
    const filePath = queue.shift();
    if (visited.has(filePath)) continue;
    visited.add(filePath);
    if (!isPackageNonLocaleSource(filePath)) continue;

    const text = ts.sys.readFile(filePath);
    if (text === undefined) continue;

    const sourceFile = ts.createSourceFile(
      filePath,
      text,
      ts.ScriptTarget.Latest,
      /* setParentNodes */ false,
    );

    const deps = [];
    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) {
        return;
      }
      const moduleSpecifier = node.moduleSpecifier;
      if (!moduleSpecifier || !ts.isStringLiteral(moduleSpecifier)) return;

      const resolved = ts.resolveModuleName(
        moduleSpecifier.text,
        filePath,
        options,
        compilerHost,
        moduleResolutionCache,
      ).resolvedModule;
      if (!resolved?.resolvedFileName || resolved.isExternalLibraryImport) {
        return;
      }
      const depPath = path.resolve(resolved.resolvedFileName);
      if (!isPackageNonLocaleSource(depPath)) return;

      deps.push(depPath);
      queue.push(depPath);
    });

    dependenciesMap.set(filePath, deps);
    for (const dep of deps) {
      const dependents = dependentsMap.get(dep) || [];
      dependentsMap.set(dep, [...dependents, filePath]);
    }
  }

  return { dependenciesMap, dependentsMap };
}

const { dependenciesMap, dependentsMap } = discoverPackageFiles(sources);

const sourceFilesByDir = groupByDir(dependenciesMap);

for (const [directory, sourceFilesInDir] of sourceFilesByDir) {
  const relativeDir = relativeToCwd(directory);

  if (isIgnoredDir(relativeDir) || path.basename(relativeDir) === 'locales') {
    continue;
  }

  const localesDir = path.join(directory, 'locales');

  // sourceFilesInDir OR filesToGlob(directory, sourceFilesInDir) OR `${directory}/*.{ts,tsx,js,jsx}`

  // Extract
  await extract.handler({
    filesPaths: sourceFilesInDir.map(relativeToCwd),
    output: relativeToCwd(path.join(localesDir, '%lang%.json')),
    langs: DEFAULT_LANGS,
    definedDefault: DEFAULT_LANGS, // define empty locales for all langs
    skipIndex: true,
    skipEmpty: true,
  });

  const hasLocales = await fileExists(
    path.join(localesDir, `${DEFAULT_LANG}.json`),
  );

  const isView = isDirectSubDir(viewsDir, relativeDir);

  // Compile & create indexes
  if (hasLocales) {
    console.log(
      `⚙️ Extracted locales in ${relativeDir}`,
      `from:\n    - ${sourceFilesInDir.map(relativeToCwd).join('\n    - ')}`,
    );

    await compile.handler({
      localesPaths: [relativeToCwd(path.join(localesDir, '%lang%.json'))],
      output: relativeToCwd(path.join(localesDir, 'compiled/%lang%.json')),
      langs: DEFAULT_LANGS,
      skipIndex: true,
    });

    if (!isView) {
      await createIndex(localesDir);
    }
  }

  if (isView) {
    const dependentsOfView = sourceFilesInDir.reduce((accu, sourceFile) => {
      const dependents = dependentsMap.get(sourceFile);
      if (dependents?.length) {
        accu.push(
          ...dependents
            // exclude deps from other views
            .filter(
              (dep) => !(isInDir(viewsDir, dep) && !isInDir(directory, dep)),
            ),
        );
      }
      return accu;
    }, []);
    const viewDeps = collectDeps(
      dependenciesMap,
      [...dependentsOfView, ...sourceFilesInDir],
      directory,
    );

    const depsLocalesDirs = [];
    for (const viewDep of viewDeps) {
      const depLocalesDir = path.join(path.dirname(viewDep), 'locales');
      if (depLocalesDir === localesDir) continue;

      const depDefaultLocalePath = path.join(
        depLocalesDir,
        `${DEFAULT_LANG}.json`,
      );
      if (
        !depsLocalesDirs.includes(depLocalesDir) &&
        await fileExists(depDefaultLocalePath)
      ) {
        depsLocalesDirs.push(depLocalesDir);
      }
    }

    await fs.mkdir(localesDir, { recursive: true, force: true });

    await createViewIndex(directory, depsLocalesDirs, hasLocales);
  }
}

/* Global fetchLocale for App Router */

const allCompiledDirs = [];

for (const [directory] of sourceFilesByDir) {
  const localesDir = path.join(directory, 'locales');
  if (await fileExists(path.join(localesDir, `${DEFAULT_LANG}.json`))) {
    allCompiledDirs.push(path.relative(path.join(root, 'src'), localesDir));
  }
}

if (allCompiledDirs.length) {
  const appLocalesDir = path.join(root, 'src/app/locales');
  const indexPath = path.join(appLocalesDir, 'index.ts');

  /* eslint-disable no-template-curly-in-string */
  const content = `${dedent`
    // DOES NOT EDIT, generated file by 'oa-intl'

    /* eslint-disable */

    export default async function fetchLocale(locale) {
      return Promise.all([
        ${allCompiledDirs
          .sort()
          .map((dir) => {
            const rel = path.relative('src/app/locales', path.join('src', dir));
            return `import(\`${rel}/compiled/${'${locale}'}.json\`).then((mod) => mod.default),`;
          })
          .join('\n        ')}
      ])
        .then((results) => Object.assign({}, ...results))
        .catch((e) => {
          console.error(\`Failed to fetch locale ${'${locale}'}\`, e);
          return {};
        });
    }
    `}\n`;
  /* eslint-enable no-template-curly-in-string */

  await fs.mkdir(appLocalesDir, { recursive: true });
  await fs.writeFile(indexPath, content);

  console.log(
    `✔️ Create ${relativeToCwd(indexPath)} (global, ${allCompiledDirs.length} sources)`,
  );
}
