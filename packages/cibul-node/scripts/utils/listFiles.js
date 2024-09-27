import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const require = createRequire(import.meta.url);

function getDependencies(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    const ast = acorn.parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
    });

    const dependencies = [];
    walk.simple(ast, {
      ImportDeclaration({ source }) {
        dependencies.push(source.value);
      },
      ExportNamedDeclaration({ source }) {
        if (source) {
          dependencies.push(source.value);
        }
      },
      ExportAllDeclaration({ source }) {
        if (source) {
          dependencies.push(source.value);
        }
      },
      CallExpression(node) {
        if (
          node.callee.name === 'require'
          && node.arguments.length > 0
          && node.arguments[0].type === 'Literal'
        ) {
          dependencies.push(node.arguments[0].value);
        }
      },
      ImportExpression({ source }) {
        if (source.type === 'Literal') {
          dependencies.push(source.value);
        }
      },
    });

    return dependencies;
  } catch (e) {
    console.error(`Cannot get dependencies of "${filePath}"`);
    throw e;
  }
}

function resolveModule(baseDir, module) {
  try {
    return require.resolve(path.resolve(baseDir, module));
  } catch (e) {
    return null;
  }
}

export default function listFiles(entryFile, jsOnly = false) {
  const visitedFiles = new Set();
  const fileList = [];

  function visit(file) {
    const resolvedFile = resolveModule(path.dirname(file), file);
    if (
      resolvedFile
      && !visitedFiles.has(resolvedFile)
      && fs.existsSync(resolvedFile)
    ) {
      visitedFiles.add(resolvedFile);
      const dependencies = getDependencies(resolvedFile)
        .map((dep) => resolveModule(path.dirname(resolvedFile), dep))
        .filter(Boolean);
      dependencies.forEach((dep) => visit(dep));
      if (!jsOnly || path.extname(resolvedFile) === '.js') {
        fileList.push(resolvedFile);
      }
    }
  }

  visit(entryFile);
  return fileList;
}
