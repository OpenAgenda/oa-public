export default function streamPDF(config, req, res) {
  const {
    services: { pdfExports },
  } = req.app;

  const { withImageLimit = 200 } = config;

  const { locationInHeader, sort = [] } = req.query;

  const sections = []
    .concat(sort)
    .map((s) => s.replace(/\.asc|\.desc/, ''))
    .filter((s) => !['lastTimingWithFeatured', 'timings'].includes(s));

  req
    .search(req.searchQuery, { size: 0 }, req.searchOptions)
    .then(({ total }) => {
      pdfExports.agenda.GenerateExportStream(req.stream, res, {
        agenda: req.agenda,
        lang: req.query.lang ?? req.lang,
        includeEventImages: total < withImageLimit,
        mode: locationInHeader === 'true' ? 'locationName' : undefined,
        sections: sections.length ? sections : null,
      });

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.pdf"`,
      });
    });
}
