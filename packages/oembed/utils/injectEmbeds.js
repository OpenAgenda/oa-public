'use strict';

const _ = require('lodash');
const { parse } = require('node-html-parser');
const validateOptions = require('../validators/injectEmbedsOptions');

function convertScriptToHtml(script, cspNonce) {
  let attributes = Object.keys(script)
    .map(key => (script[key] === true ? key : `${key}="${script[key]}"`))
    .join(' ');

  if (cspNonce) {
    attributes += ` nonce="${cspNonce}"`;
  }

  return `<script ${attributes}></script>`;
}

module.exports = (html = '', linkEmbedPairs = [], options) => {
  if (!linkEmbedPairs || !linkEmbedPairs.length) {
    return html;
  }

  const { includeEmbedScripts, cspNonce } = validateOptions(options);

  const HTMLWithEmbeds = parse(html)
    .querySelectorAll('a')
    .reduce((injected, aNode) => {
      if (aNode.rawAttrs.indexOf('href') === -1) {
        return injected;
      }

      const match = _.find(linkEmbedPairs, {
        link: _.unescape(aNode.rawAttrs.split('href="').pop().split('"').shift())
      });

      if (!match) {
        return injected;
      }

      const embedCode = match.data?.html;

      if (!embedCode) {
        return injected;
      }

      return injected.replace(aNode.outerHTML, embedCode);
    }, html);

  if (!includeEmbedScripts) {
    return HTMLWithEmbeds;
  }

  const scripts = linkEmbedPairs
    .filter((obj, index, self) => {
      if (!obj.data?.script) return false;
      return index === self.findIndex(o => o.data?.script?.src === obj.data.script.src);
    })
    .map(link => convertScriptToHtml(link.data.script, cspNonce));

  return `${HTMLWithEmbeds}${scripts.join('')}`;
}
