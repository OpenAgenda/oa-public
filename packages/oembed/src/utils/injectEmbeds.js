'use strict';

const _ = require('lodash');
const sanitize = require('sanitize-html');

module.exports = (html = '', linkEmbedPairs = []) => {
  if (!linkEmbedPairs || !linkEmbedPairs.length) {
    return html;
  }
  return sanitize(html, {
    allowedTags: false,
    allowedAttributes: false,
    transformTags: {
      a: (tagName, attribs) => {
        const match = _.find(linkEmbedPairs, { link: attribs.href });

        if (!match) {
          return { tagName, attribs };
        }

        return {
          tagName: 'div',
          text: match.data.html
        }
      }
    }
  });
}
