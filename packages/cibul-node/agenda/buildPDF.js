'use strict';

const pdf = require('@openagenda/pdf');
const log = require('@openagenda/logs')('agenda/buildPDF');
const convertEventToLegacyFormat = require('@openagenda/legacy/convertEventToLegacyFormat');

module.exports = async function buildPDF(req, res, _next) {
  const {
    legacy: {
      tagsAndCustom,
    },
    core,
  } = req.app.services;

  const config = req.app.core.getConfig();

  const tagSet = await tagsAndCustom.getTagSet(req.params.uid);
  const categorySet = await tagsAndCustom.getCategorySet(req.params.uid);
  const formSchema = await req.app.core.agendas(req.params.uid).settings.get({
    access: 'internal',
  });

  const stream = await core.agendas(req.params.uid).events.search(
    req.query,
    null,
    { stream: true, detailed: true },
  );

  const pdfStream = pdf({
    title: req.agenda.title,
    description: req.agenda.description,
    link: req.agenda.url,
    imageLink: req.agenda.image,
  }, {
    lang: req.lang,
    style: {},
  }, {
    showLinks: {
      event: true,
      agenda: true,
    },
  });

  pdfStream.getReadableStream().pipe(res);

  try {
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'content-disposition': `attachment; filename="contributors.${req.agenda.title}.pdf"`,
    });
  } catch (error) {
    log.error(`could not build PDF for agenda ${req.agenda.uid}`, error);
    throw error;
  }

  for await (const event of stream) {
    const legacyEvent = convertEventToLegacyFormat({
      uid: req.params.uid,
      slug: req.agenda.slug,
      legacy: { tagSet, categorySet },
      formSchema,
      admin: false,
      root: config.root,
    }, event);

    pdfStream.write({
      ...legacyEvent,
      registration: legacyEvent.registration.map(r => r.value),
    });
  }

  pdfStream.end();
};
