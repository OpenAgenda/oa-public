import agendaSearchPage from './lib/agendaSearchPage.js';
import loadNetwork from './lib/loadNetwork.js';
import loadLocationSet from './lib/loadLocationSet.js';
import redirect, { slashed as redirectSlashed } from './lib/redirect.js';

export default (config, services, agendaSearch, app, base) => {
  app.get(base, [
    redirectSlashed,
    loadNetwork,
    loadLocationSet,
    agendaSearch.mw.list,
    agendaSearchPage(config),
  ]);

  app.get(`${base}.:format`, [
    agendaSearch.mw.list,
  ]);

  app.get(`${base}/rebuild`, [
    agendaSearch.mw.rebuild,
    redirect('rebuilding agenda search index'),
  ]);

  app.get(`${base}/update`, [
    agendaSearch.mw.update,
    redirect('updating agenda search index (with agendas updated less than 1 hour ago)'),
  ]);
};
