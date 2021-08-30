"use strict";

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const rss = require('rss');

const log = require('@openagenda/logs')('middleware');

const getLabel = require('@openagenda/labels')(require('@openagenda/labels/agenda-search/index'));

const url = require('./url');

const createFactory = type => React.createElement.bind(null, type);

const Body = createFactory(require('../../components/lib/Body.js'));

module.exports = service => ({
  rebuild: rebuild.bind(null, service),
  update: update.bind(null, service),
  list: list.bind(null, service)
});

async function rebuild(service, req, res, next) {
  if (req.log) log('info', 'starting agenda search index rebuild');

  next();

  service.rebuild().then(() => {
    log('info', 'completed agenda search index rebuild')
  }, err => {
    log('error', 'errored during agenda search rebuild', err);
  });
}

async function update(service, req, res, next) {
  if (req.log) log('info', 'starting agenda search index update');

  next();

  service.resyncUpdated().then(({ indexed, updated }) => {
    log('info', 'completed agenda search index update with %s updates and %s indexes', updated, indexed);
  }, err => {
    log('error', 'errored during agenda search update', err);
  });
}


function list(service, req, res, next) {
  service.list(req.query, req.query, {
    includeFields: ['summary', 'network', 'locationSet'],
    useDefaultImage: true
  }).then(result => {
    if (req.params.format === 'json') {
      return res.json(result);
    }
    
    req.result = result;

    if (req.params.format === 'rss') {
      return _renderRss(service, req, res);
    }

    req.content = ReactDOMServer.renderToString(Body({
      ...result,
      lang: req.lang,
      network: req.network,
      locationSet: req.locationSet,
    }));

    next();
  }, next);
}


function _renderRss(service, req, res) {
  const {
    site
  } = service.getConfig();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const feed = new rss({
    title: getLabel('genericSearchTitle', req.lang),
    feed_url: site.url + req.originalUrl,
    site_url: 'https://' + req.get('host'),
    generator: 'OpenAgenda',
    image_url: site.image,
    pubDate: today,
    language: req.lang,
    ttl: 24*60
  });

  req.result.agendas.forEach(a => {
    feed.item({
      title: a.title,
      description: a.description,
      url: url.agenda(a, {
        path: site.url,
        lang: req.lang
      }),
      guid: a.uid,
      date: a.createdAt
    });
  }) ;

  res.set('Content-Type', 'application/rss+xml');

  res.send(feed.xml());
}
