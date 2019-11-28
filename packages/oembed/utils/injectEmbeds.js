'use strict';

const _ = require('lodash');
const { parse } = require('node-html-parser');

module.exports = (html = '', linkEmbedPairs = []) => {
  if (!linkEmbedPairs || !linkEmbedPairs.length) {
    return html;
  }

  return parse(html)
    .querySelectorAll('a')
    .reduce((injected, aNode) => {

      if (aNode.rawAttrs.indexOf('href')===-1) {
        return injected;
      }

      const link = aNode.rawAttrs.split('href="').pop().split('"').shift();

      const match = _.find(linkEmbedPairs, { link });

      if (!match) {
        return injected;
      }

      const embedCode = match.data ? match.data.html : match.code;

      if (!embedCode) {
        return injected;
      }

      return injected.replace(aNode.outerHTML, embedCode);
    }, html);
}
