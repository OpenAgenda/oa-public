'use strict';

const expressUtils = require('@openagenda/utils/express');
const agendaSearchPage = require('./lib/agendaSearchPage');
const loadNetwork = require('./lib/loadNetwork');
const loadLocationSet = require('./lib/loadLocationSet');
const redirect = require('./lib/redirect');

module.exports = (config, services, agendaSearch, app, base) => {
  app.get(base, [
    expressUtils.https,
    redirect.slashed,
    loadNetwork,
    loadLocationSet,
    agendaSearch.mw.list,
    agendaSearchPage(config)
  ]);

  app.get(`${base}.:format`, [
    expressUtils.https,
    agendaSearch.mw.list
  ]);

  app.get(`${base}/rebuild`, [
    agendaSearch.mw.rebuild,
    redirect('rebuilding agenda search index')
  ]);

  app.get(`${base}/update`, [
    agendaSearch.mw.update,
    redirect('updating agenda search index (with agendas updated less than 1 hour ago)')
  ]);
};
