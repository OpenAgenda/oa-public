'use strict';

const slug = require('slug');

const cancelled = [
  /^annule/g,
  /^cancelled/g,
  /^abgesagt/g
];

module.exports = title => {
  if (!title) {
    throw new Error('No title was provided');
  }

  for (const titleStr of Object.values(title)) {

    const matches = cancelled.filter(rgx => !!slug(titleStr, { lower: true }).match(rgx));
    if (matches.length) {
      return true;
    }
  }

  return false;
}
