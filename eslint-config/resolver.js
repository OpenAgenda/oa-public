const path = require('node:path');
const { builtinModules } = require('node:module');
const fs = require('graceful-fs');
const enhancedResolve = require('enhanced-resolve');
const CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');

const builtins = new Set(builtinModules);

const nodeFileSystem = new CachedInputFileSystem(fs, 4000);

const commonjsOptions = {
  conditionNames: ['node', 'require', 'default'],
  extensions: ['.js', '.json', '.node'],
  mainFields: ['main'],
  fullySpecified: false,
};

const esmOptions = {
  conditionNames: ['node', 'import', 'default'],
  mainFields: ['module', 'main'],
  fullySpecified: true,
};

const commonjsResolver = enhancedResolve.create.sync({
  fileSystem: nodeFileSystem,
  ...commonjsOptions,
});
const esmResolver = enhancedResolve.create.sync({
  fileSystem: nodeFileSystem,
  ...esmOptions,
});

function getModuleType(file) {
  if (file.endsWith('.cjs')) {
    return 'commonjs';
  }

  if (file.endsWith('.mjs')) {
    return 'module';
  }

  let currentDir = path.dirname(file);

  while (currentDir && currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      if (packageJson.type === 'module') {
        return 'module';
      }
    } catch (e) {
      // Ignore errors (e.g., file not found)
    }

    currentDir = path.dirname(currentDir);
  }

  return 'commonjs';
}

function getResolver(file) {
  const moduleType = getModuleType(file);
  return moduleType === 'module' ? esmResolver : commonjsResolver;
}

function resolve(source, file, config) {
  if (builtins.has(source.replace(/^node:/, ''))) {
    return { found: true, path: null };
  }

  try {
    const resolver = config
      ? enhancedResolve.create.sync({
        fileSystem: nodeFileSystem,
        ...commonjsOptions,
        ...config,
      })
      : getResolver(file);
    const result = resolver(path.dirname(file), source);

    return { found: true, path: result };
  } catch (e) {
    return { found: false };
  }
}

module.exports = {
  interfaceVersion: 2,
  resolve,
};
