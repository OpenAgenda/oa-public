'use strict';

const slugify = require('slugify');
const defineUnique = require('./defineUnique');

const rand = () => Math.ceil(Math.random() * 9999999);

module.exports = async (service, event) => {
  const title = event.title?.[Object.keys(event.title ?? {}).pop()] ?? `${rand()}`;

  return defineUnique(service, 'slug', previous => slugify(
    title,
    { lower: true, strict: true }
  ) + (previous ? '-' + rand() : ''));
}
