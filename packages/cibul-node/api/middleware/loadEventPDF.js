function cleanImages({ event, agenda, app }) {
  const clean = {
    event,
    agenda,
  };

  const config = app.services.core.getConfig();

  if (event.image?.filename) {
    clean.event = {
      ...event,
      image: {
        ...event.image,
        base: event.image.base.replace('cibuldev', 'cibul'),
      },
    };
  }

  if (agenda.image) {
    clean.agenda = {
      ...agenda,
      image: agenda.image.replace('cibuldev', 'cibul'),
    };
  }

  if (event.location?.image) {
    clean.event.location = {
      ...event.location,
      image: `${config.aws.imageBucketPath}${event.location.image}`.replace(
        'cibuldev',
        'cibul',
      ),
    };
  }

  return clean;
}

export default function loadEventPDF(req, res, next) {
  const {
    services: { pdfExports },
  } = req.app;
  const { agenda, event } = cleanImages(req);
  try {
    pdfExports.event.GenerateExport(res, {
      agenda,
      event,
      lang: req.lang,
    });
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-disposition': `attachment; filename="${req.agenda.slug}.${req.event.slug}.pdf"`,
    });
  } catch (e) {
    next(e);
  }
}
