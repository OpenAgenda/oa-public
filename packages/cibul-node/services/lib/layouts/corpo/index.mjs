import fs from 'node:fs';
import _ from 'lodash';
import ih from 'immutability-helper';
import flattenLabels from '@openagenda/labels/flatten.js';
import labels from '@openagenda/labels/corpo/layout.js';

function parser(data) {
  return ih(data, {
    labels: { $set: flattenLabels(labels, data.lang) },
    tel: { $set: '+33972178337' },
    languages: {
      $set: data.languages.map((l, i) => ({
        className: l === data.lang ? 'selected' : '',
        value: l,
        label: l.toUpperCase(),
        separator: i < data.languages.length - 1,
      })),
    },
  });
}

export default {
  render: _.template(fs.readFileSync(`${import.meta.dirname}/layout.tpl`, 'utf-8')),
  parser,
};
