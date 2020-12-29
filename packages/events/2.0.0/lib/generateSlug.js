'use strict';

const slugify = require('slugify');
const defineUnique = require('./defineUnique');

module.exports = async (service, event) => {
  const title = event.title[Object.keys(event.title).pop()];

  return defineUnique(service, 'slug', previous => slugify(
    title,
    { lower: true, strict: true }
  ) + (previous ? '_' + Math.ceil(Math.random() * 9999999) : ''));
}
