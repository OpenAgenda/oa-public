import agendaSearchPage from './lib/agendaSearchPage.mjs';
import loadNetwork from './lib/loadNetwork.mjs';
import loadLocationSet from './lib/loadLocationSet.mjs';
import redirect, { slashed as redirectSlashed } from './lib/redirect.mjs';

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
