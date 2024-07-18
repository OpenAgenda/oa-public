import fs from 'node:fs';
import _ from 'lodash';
import ih from 'immutability-helper';

function parser(data) {
  return ih(data, {
    title: { $set: _.get(data, 'agenda.title', data.title) },
  });
}

export default {
  parent: 'main',
  render: _.template(fs.readFileSync(`${import.meta.dirname}/layout.tpl`, 'utf-8')),
  parser,
};
