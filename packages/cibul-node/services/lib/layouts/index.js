'use strict';

const fs = require('node:fs');
const _ = require('lodash');
const ih = require('immutability-helper');

module.exports = (() => {
  const layouts = _loadLayouts();

  return _.mapValues(layouts, ({ parent, parser, render }) => (content, data = {}) => {
    const parsedData = parser ? parser(data) : data;

    const rendered = render(parsedData).replace('{content}', content);

    return parent ? module.exports[parent](rendered, parsedData) : rendered;
  });
})();

module.exports.load = (layoutName, preLoaded = {}) => (content, data = {}) => module.exports[layoutName](content, _.assign({}, preLoaded, data));

function _loadLayouts() {
  return fs.readdirSync(__dirname)
    .filter(filename => filename.split('.').length === 1)
    .filter(filename => !['test'].includes(filename))
    .reduce(
      (layouts, layoutName) => _.set(layouts, layoutName, require(`${__dirname}/${layoutName}`)),
      {},
    );
}
