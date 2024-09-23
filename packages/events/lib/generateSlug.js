'use strict';

const slugify = require('slugify');
const defineUnique = require('./defineUnique');

const rand = () => Math.ceil(Math.random() * 9999999);
const pickARandomLetter = () =>
  'abcdefghijklmnopqrstuvxyz'[Math.ceil(Math.random() * 24)];

function GenerateSlug(event) {
  const title = event.title?.[Object.keys(event.title ?? {}).pop()] ?? `${rand()}`;

  return (previous) => {
    let slug = slugify(title, { lower: true, strict: true });
    if (!slug.length) {
      for (let i = 0; i < title.length; i += 1) {
        slug += pickARandomLetter();
      }
    }
    return `${slug}${previous ? `-${rand()}` : ''}`;
  };
}

module.exports = async (service, event) =>
  defineUnique(service, 'slug', GenerateSlug(event));
