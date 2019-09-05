'use strict';

const roleValues = require('./roleValues');

const isNumberLike = value => !Number.isNaN(Number(value)) && Number.isFinite(parseInt(value, 10));

module.exports = role => {
  const match = roleValues.find(p => (isNumberLike(role)
    ? Number(role) === p.code
    : String(role).toUpperCase() === p.key));

  return match ? match.code : null;
};
