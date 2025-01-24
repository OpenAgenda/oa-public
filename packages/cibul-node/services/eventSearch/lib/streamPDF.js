export default function streamPDF(config, req, res) {
  const {
    services: { pdfExports },
  } = req.app;

  const { withImageLimit = 200 } = config;

  const { locationInHeader, sort = [] } = req.query;

  req
    .search(req.searchQuery, { size: 0 }, req.searchOptions)
    .then(({ total }) => {
      pdfExports.agenda.GenerateExportStream(req.stream, res, {
        agenda: req.agenda,
        includeEventImages: total < withImageLimit,
        mode: locationInHeader === 'true' ? 'locationName' : undefined,
        sections: sort.length
          ? sort.map((s) => s.replace(/\.asc|\.desc/, ''))
          : null,
      });

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.pdf"`,
      });
    });
}
