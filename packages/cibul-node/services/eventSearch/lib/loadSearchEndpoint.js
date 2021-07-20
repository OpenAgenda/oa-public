'use strict';

module.exports = core => (req, res, next) => {
  req.search = core
    .agendas(req.params.agendaUid)
    .events.search;

  req.searchOptions = {
    ...req.query,
    stream: false,
    detailed: true,
    access: req.access ?? 'public'
  };

  req.searchQuery = {
    ...req.query
  };

  delete req.searchQuery.state;

  if (req.user?.uid) {
    req.searchOptions.userUid = req.user.uid;
    req.searchQuery.state = req.query.state === undefined ? null : req.query.state;
  }

  next();
};
