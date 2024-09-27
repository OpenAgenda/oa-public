'use strict';

const fs = require('node:fs');

const _ = require('lodash');

const labels = require('@openagenda/labels/corpo/pages');
const segmentPages = require('./segment-pages');

// let default label be english

module.exports = (basePath) => {
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
    baseDir: `${__dirname}/templates`,
    throwOnUnknown: false,
  };

  fs.readdirSync(`${__dirname}/templates`).forEach((f) => {
    params.templates[f.split('.')[0]] = fs.readFileSync(
      `${__dirname}/templates/${f}`,
      'utf-8',
    );
  });

  ['pages', 'segments'].forEach((namespace) => {
    fs.readdirSync(`${__dirname}/${namespace}`).forEach((p) => {
      params[namespace].push(
        _.assign(
          {
            key: p.split('.')[0],
          },
          JSON.parse(
            fs.readFileSync(`${__dirname}/${namespace}/${p}`, 'utf-8'),
          ),
        ),
      );
    });
  });

  return segmentPages(params);
};
