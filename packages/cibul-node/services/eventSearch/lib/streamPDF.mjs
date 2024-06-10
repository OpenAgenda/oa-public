export default function streamPDF(config, req, res) {
  const {
    services: {
      pdfExports,
    },
  } = req.app;

  const {
    withImageLimit = 200,
  } = config;

  req.search(req.searchQuery, { size: 0 }, req.searchOptions).then(({ total }) => {
    pdfExports.GenerateExportStream(req.stream, res, {
      agenda: req.agenda,
      includeEventImages: total < withImageLimit,
    });

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-disposition': `attachment; filename="${req.agenda.slug}.agenda.pdf"`,
    });
  });
}
