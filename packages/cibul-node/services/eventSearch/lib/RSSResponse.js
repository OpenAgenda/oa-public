import { rss } from '@openagenda/flat-exports';
import VError from '@openagenda/verror';

function getDateField(sort) {
  if (sort === 'updatedAt.desc' || sort === 'updatedAt.asc') {
    return 'updatedAt';
  }

  if (sort === 'lastTimingWithFeatured.asc') {
    return 'nextTiming.begin';
  }

  return 'updatedAt';
}

export default (core) => async (req, res, next) => {
  const {
    root,
    s3: { mainBucketPath },
  } = core.getConfig();

  try {
    const query = {
      sort: 'updatedAt.desc',
      embed_url: null,
      ...req.searchQuery,
    };

    const {
      result: { events },
      agenda,
    } = await req.search(query, req.query, {
      ...req.searchOptions,
      returnAgenda: true,
      longDescriptionFormat: 'HTML',
    });

    const rssOptions = {
      title: agenda.title,
      description: agenda.description,
      feedURL: root + req.originalUrl,
      siteURL: root,
      imageURL: agenda.image ? `${mainBucketPath}${agenda.image}` : null,
      language: req.lang,
      pubDate: agenda.updatedAt,
      dateField: getDateField(query.sort),
    };

    if (query.embed_url) {
      rssOptions.genUrl = (e) => `${query.embed_url}?oaq[uid]=${e.uid}`;
    }

    const categoryFields = [].concat(req.query.category ?? []).filter(Boolean);
    if (categoryFields.length) {
      rssOptions.categoryFields = categoryFields;
      rssOptions.formSchema = req.formSchema;
    }

    const feed = rss(rssOptions);

    events.forEach((e) => feed.addEvent(e));

    res.set('Content-Type', 'application/rss+xml');

    res.send(feed.xml());
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next({
        code: 400,
        json: { errors: VError.info(err).errors },
      });
    }

    return next(err);
  }
};
