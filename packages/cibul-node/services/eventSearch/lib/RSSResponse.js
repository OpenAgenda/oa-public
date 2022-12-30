'use strict';

const rss = require('@openagenda/flat-exports/rss');

module.exports = core => async (req, res, next) => {
  const {
    root,
    aws: {
      imageBucketPath,
    },
  } = core.getConfig();

  try {
    const query = {
      sort: 'updatedAt.desc',
      embed_url: null,
      ...req.searchQuery,
    };

    const {
      result: {
        events,
      },
      agenda,
    } = await req.search(query, req.query, {
      ...req.searchOptions,
      returnAgenda: true,
    });

    const rssOptions = {
      title: agenda.title,
      description: agenda.description,
      feedURL: root + req.originalUrl,
      siteURL: root,
      imageURL: agenda.image ? `${imageBucketPath}${agenda.image}` : null,
      language: req.lang,
      pubDate: agenda.updatedAt,
    };

    if (query.embed_url) {
      rssOptions.genUrl = e => `${query.embed_url}?oaq[uid]=${e.uid}`;
    }

    const feed = rss(rssOptions);

    events.forEach(e => feed.addEvent(e));

    res.set('Content-Type', 'application/rss+xml');

    res.send(feed.xml());
  } catch (err) {
    return next(err);
  }
};
