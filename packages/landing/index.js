import fs from 'node:fs';
import _ from 'lodash';
import labels from '@openagenda/labels/corpo/pages.js';
import segmentPages from './segment-pages/index.js';

// let default label be english

export default (basePath) => {
  const existingLanguages = _.keys(basePath);

  _.keys(labels).forEach((field) => {
    existingLanguages.forEach((lang) => {
      if (lang !== 'en' && !labels[field][lang]) {
        labels[field][lang] = labels[field].en;
      }
    });
  });

  const params = {
    templates: {},
    pages: [],
    segments: [],
    labels,
    basePath,
    baseDir: `${import.meta.dirname}/templates`,
    throwOnUnknown: false,
  };

  fs.readdirSync(`${import.meta.dirname}/templates`).forEach((f) => {
    params.templates[f.split('.')[0]] = fs.readFileSync(
      `${import.meta.dirname}/templates/${f}`,
      'utf-8',
    );
  });

  ['pages', 'segments'].forEach((namespace) => {
    fs.readdirSync(`${import.meta.dirname}/${namespace}`).forEach((p) => {
      params[namespace].push(
        _.assign(
          {
            key: p.split('.')[0],
          },
          JSON.parse(
            fs.readFileSync(
              `${import.meta.dirname}/${namespace}/${p}`,
              'utf-8',
            ),
          ),
        ),
      );
    });
  });

  return segmentPages(params);
};
