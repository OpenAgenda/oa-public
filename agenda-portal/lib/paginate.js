'use strict';

const _ = require('lodash');

const maxPages = 10;

module.exports = ({ offset, limit, total }) => {
  const current = Math.floor(offset / limit) + 1;
  const totalPages = Math.floor(total / limit) + 1;

  const pages = _.times(Math.ceil(total / limit), index => ({
    page: index + 1,
    offset: index * limit,
    current: index + 1 === current
  })).filter(p => Math.abs(p.page - current) < maxPages / 2);

  if (!pages.length) return [];

  pages[0].previous = pages[0].page !== 1;

  pages[pages.length - 1].next = _.last(pages).page < totalPages;

  return pages;
};
