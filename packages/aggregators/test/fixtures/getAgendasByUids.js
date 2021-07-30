'use strict';

const agendas = require('./review.data.json');

module.exports = async (uids = [], options = {}) => {
  const { search = null, slug = null } = options;

  return agendas
    .filter(a => uids.includes(a.uid))
    .filter(a => (search ? a.title.indexOf(search) !== -1 : true))
    .filter(a => (slug ? a.slug === slug : true));
};
