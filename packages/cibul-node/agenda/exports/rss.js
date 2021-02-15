"use strict";

const _ = require('lodash');
const rss = require('@openagenda/flat-exports/rss');
const config = require('../../config');

module.exports = () => async (req, res, next) => {
  try {
    const query = _.extend({
      sort: 'updatedAt.desc',
      embed_url: null
    }, req.query);
    const { services } = req.app;

    const { events } = await services.eventSearch.agendas(req.agenda.uid)
      .search(req.query, req.query, { detailed: true });

    const rssOptions = {
      title: req.agenda.title,
      description: req.agenda.description,
      feedURL: config.root + req.originalUrl,
      siteURL: config.root,
      imageURL: req.agenda.image ? config.aws.imageBucketPath + req.agenda.image : null,
      language: req.lang,
      pubDate: req.agenda.updatedAt
    };

    if (query.embed_url) {
      rssOptions.genUrl = e => query.embed_url + '?oaq[uid]=' + e.uid;
    }

    const feed = rss(rssOptions);

    events.forEach(e => feed.addEvent(e));

    res.set('Content-Type', 'application/rss+xml');

    res.send(feed.xml());
  } catch (err) {
    return next(err);
  }
}
