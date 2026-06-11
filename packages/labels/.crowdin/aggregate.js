'use strict';

const fs = require('fs');
const path = require('path');
const { mkdirp } = require('mkdirp');
const { DEFAULT_LANGS } = require('@openagenda/intl');
const getLabelFiles = require('../getLabelFiles');

const labelFiles = getLabelFiles();

for (const lang of DEFAULT_LANGS) {
  for (const labelFile of labelFiles) {
    const labels = require(path.join(__dirname, '..', labelFile));

    const dirname = path.dirname(labelFile);
    const fileName = labelFile.replace(/\.js$/, '.json');
    const localePath = path.join(__dirname, 'locales', lang, fileName);

    const locales = getLocaleLabels(labels, lang, localePath);

    mkdirp.sync(path.join(__dirname, 'locales', lang, dirname));

    fs.writeFileSync(localePath, `${JSON.stringify(locales, null, 2)}\n`);
  }
}

// Remove deleted files
for (const file of getLabelFiles.walkSync('locales', __dirname)) {
  const labelFile = file
    .split('/')
    .slice(2)
    .join('/')
    .replace(/\.json$/, '.js');
  const removed = !labelFiles.find((v) => v === labelFile);
  if (removed) {
    fs.unlinkSync(path.join(__dirname, file));
  }
}

function getLocaleLabels(labels, lang, localePath) {
  const values = {};

  for (const key in labels) {
    const value = labels[key][lang];

    if (value) {
      values[key] = value;
    }
  }

  // Preserve the key order of the existing locale file to avoid spurious
  // reordering diffs: crowdin returns keys alphabetically sorted, so blindly
  // emitting them in source-JS order churns every file on each round-trip.
  let existingOrder = [];
  try {
    existingOrder = Object.keys(JSON.parse(fs.readFileSync(localePath, 'utf-8')));
  } catch (e) {
    // No existing locale file yet.
  }

  // Already-sorted files (translations as crowdin returns them, and brand-new
  // files crowdin will sort anyway) stay fully sorted, so new keys land in
  // their final position instead of churning on the next round-trip. Files in
  // a custom order (e.g. the source-language `en` dumps, kept in source-JS
  // order) keep that order; new keys are appended.
  const isSorted = existingOrder.every(
    (key, i) => i === 0 || existingOrder[i - 1] <= key,
  );

  if (isSorted) {
    return Object.keys(values)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: values[key] }), {});
  }

  const result = {};

  for (const key of existingOrder) {
    if (key in values) {
      result[key] = values[key];
    }
  }

  for (const key in values) {
    if (!(key in result)) {
      result[key] = values[key];
    }
  }

  return result;
}
