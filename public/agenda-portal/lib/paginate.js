'use strict';

const _ = require('lodash');

const maxPages = 10;

module.exports = ({ offset, limit, total }) => {
  const current = Math.floor(offset / limit) + 1;
  const totalPages = Math.floor(total / limit) + 1;

  const pages = _.times(Math.ceil(total / limit), index => ({
    page: index + 1,
    offset: index * limit,
    current: index + 1 === current,
  })).filter(p => Math.abs(p.page - current) < maxPages / 2);

  if (!pages.length) return [];

  const hasPrevious = current > 1;
  const hasNext = current < totalPages;

  if (hasPrevious) {
    pages.unshift({
      page: current - 1,
      offset: (current - 2) * limit,
      current: false,
      previous: true
    });
  }

  if (hasNext) {
    pages.push({
      page: current + 1,
      offset: current * limit,
      current: false,
      next: true
    });
  }

  console.log(pages);

  return pages;
};
