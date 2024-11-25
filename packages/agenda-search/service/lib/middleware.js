import Rss from 'rss';
import logs from '@openagenda/logs';
import makeLabelGetter from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-search/index.js';
import url from './url.js';

const log = logs('middleware');

const getLabel = makeLabelGetter(labels);

async function rebuild(service, req, res, next) {
  if (req.log) log('info', 'starting agenda search index rebuild');

  next();

  service.rebuild().then(
    () => {
      log('info', 'completed agenda search index rebuild');
    },
    (err) => {
      log('error', 'errored during agenda search rebuild', err);
    },
  );
}

async function update(service, req, res, next) {
  if (req.log) log('info', 'starting agenda search index update');

  next();

  service.resyncUpdated().then(
    ({ indexed, updated }) => {
      log(
        'info',
        'completed agenda search index update with %s updates and %s indexes',
        updated,
        indexed,
      );
    },
    (err) => {
      log('error', 'errored during agenda search update', err);
    },
  );
}

function _renderRss(service, req, res) {
  const { site } = service.getConfig();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const feed = new Rss({
    title: getLabel('genericSearchTitle', req.lang),
    feed_url: site.url + req.originalUrl,
    site_url: `https://${req.get('host')}`,
    generator: 'OpenAgenda',
    image_url: site.image,
    pubDate: today,
    language: req.lang,
    ttl: 24 * 60,
  });

  req.result.agendas.forEach((a) => {
    feed.item({
      title: a.title,
      description: a.description,
      url: url.agenda(a, {
        path: site.url,
        lang: req.lang,
      }),
      guid: a.uid,
      date: a.createdAt,
    });
  });

  res.set('Content-Type', 'application/rss+xml');

  res.send(feed.xml());
}

function list(service, req, res, next) {
  service
    .list(req.query, req.query, {
      includeFields: ['summary', 'network', 'locationSet'],
      useDefaultImage: true,
    })
    .then((result) => {
      if (req.params.format === 'json') {
        return res.json(result);
      }

      req.result = result;

      if (req.params.format === 'rss') {
        return _renderRss(service, req, res);
      }

      next();
    }, next);
}

export default (service) => ({
  rebuild: rebuild.bind(null, service),
  update: update.bind(null, service),
  list: list.bind(null, service),
});
