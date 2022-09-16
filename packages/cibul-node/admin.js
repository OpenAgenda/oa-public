'use strict';

module.exports = app => {
  require('./admin/back')(app);
  require('./admin/agendas.back')(app);
};
