'use strict';

const flatExports = require('@openagenda/flat-exports');

const {
  MarkdownStream,
} = flatExports;

function getFirstSortField(query) {
  const firstSort = [].concat(query.sort).shift();

  if (!firstSort) return null;

  const parts = firstSort.split('.');

  parts.pop();

  return parts.join('.');
}

module.exports = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    charset: 'utf-8',
    'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.${req.params.format}"`,
  });

  const stream = new MarkdownStream({
    format: req.params.format,
    section: getFirstSortField(req.query),
    lang: req.lang,
    slug: req.agenda.slug,
    identifier: req.agenda.uid,
    title: req.agenda.title,
    description: req.agenda.description,
    genUrl: e => `https://openagenda.com/${req.agenda.slug}/events/${e.slug}`,
  });

  req.stream.pipe(stream).pipe(res);
};
