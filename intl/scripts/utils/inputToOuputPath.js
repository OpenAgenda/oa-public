'use strict';

const path = require('path');

module.exports = function inputToOuputPath(glob, input, dest, lang) {
  const originalGlobStarIndex = glob.indexOf('**');
  const globStarIndex = glob.replace('%lang%', lang).indexOf('**');

  const endPathParts = globStarIndex === -1 ? input.split('/') : input.slice(globStarIndex).split('/');
  const globStarPath = globStarIndex === -1 ? '' : endPathParts.slice(0, -1).join('/');
  const originalFileName = endPathParts[endPathParts.length - 1];

  // inputPath
  const startGlobPath = originalGlobStarIndex === -1 ? glob : glob.slice(0, originalGlobStarIndex);
  const inputPath = path.join(startGlobPath, globStarPath, globStarIndex === -1 ? '' : originalFileName);

  // compiledPath
  let compiledPath = dest;

  const compiledGlobStarIndex = dest.indexOf('**');

  if (compiledGlobStarIndex !== -1) {
    const compiledStartPath = dest.slice(0, compiledGlobStarIndex);
    const compiledEndPathParts = dest.slice(compiledGlobStarIndex).split('/');
    const compiledEndPath = compiledEndPathParts.slice(1).join('/');

    compiledPath = path.join(compiledStartPath, globStarPath, compiledEndPath);
  }

  // result
  const result = compiledPath
    .replace('%lang%', lang)
    .replace('%original_file_name%', originalFileName);

  return {
    result,
    inputPath,
    compiledPath,
    originalFileName,
  };
};
