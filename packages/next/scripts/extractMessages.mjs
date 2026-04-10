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

function getSourceFiles(program) {
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n',
    );

    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start,
      );
      console.log(
        `❌ Error TS${diagnostic.code}: ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
      );
    } else {
      console.log(`❌ Error TS${diagnostic.code}: ${message}`);
    }
  });

  if (allDiagnostics.length) {
    return null;
  }

  return program
    .getSourceFiles()
    .filter((sourceFile) => !sourceFile.isDeclarationFile);
}

function getDepModules(
  compilerHost,
  options,
  sourceFile,
  moduleResolutionCache,
) {
  const depModules = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        const resolved = ts.resolveModuleName(
          moduleSpecifier.text,
          sourceFile.fileName,
          options,
          compilerHost,
          moduleResolutionCache,
        ).resolvedModule;

        if (resolved?.resolvedFileName && !resolved.isExternalLibraryImport) {
          depModules.push(path.resolve(resolved.resolvedFileName));
        }
      }
    }
  });

  return depModules;
}

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
  noEmitOnError: true,
};
const program = ts.createProgram(sources, options);
const compilerHost = ts.createCompilerHost(options);

const sourceFiles = getSourceFiles(program);

if (!sourceFiles) {
  process.exit(1);
}

const dependenciesMap = new Map();
const dependentsMap = new Map();

const packageSourceFiles = sourceFiles
  .filter((sourceFile) => isInPackage(sourceFile.path))
  .filter((sourceFile) => !sourceFile.path.endsWith('/locales/index.ts'));

const moduleResolutionCache = ts.createModuleResolutionCache(
  root,
  (fileName) => fileName,
  options,
);

for (const sourceFile of packageSourceFiles) {
  const deps = getDepModules(
    compilerHost,
    options,
    sourceFile,
    moduleResolutionCache,
  )
    .filter(isInPackage)
    .filter((dep) => !dep.endsWith('/locales/index.ts'));
  dependenciesMap.set(sourceFile.path, deps);

  for (const dep of deps) {
    const dependents = dependentsMap.get(dep) || [];
    dependentsMap.set(dep, [...dependents, sourceFile.path]);
  }
}

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
    files: sourceFilesInDir.map(relativeToCwd),
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
      locales: relativeToCwd(path.join(localesDir, '%lang%.json')),
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
