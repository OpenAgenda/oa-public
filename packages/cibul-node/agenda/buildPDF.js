'use strict';

const pdf = require('@openagenda/pdf');

const convertLegacyFilter = require('@openagenda/legacy/convertLegacyFilter');
const convertEventToLegacyFormat = require('@openagenda/legacy/convertEventToLegacyFormat');

module.exports = async function buildPDF(req, res, _next) {
  const {
    legacy: {
      tagsAndCustom,
    },
    core,
  } = req.app.services;

  const tagSet = await tagsAndCustom.getTagSet(req.params.uid);
  const categorySet = await tagsAndCustom.getCategorySet(req.params.uid);
  const formSchema = await req.app.core.agendas(req.params.uid).settings.get({
    access: 'internal',
  });

  const query = convertLegacyFilter(req.query.oaq ?? {}, {
    formSchema,
    tagSet,
    categorySet,
    query: req.query,
  });

  const stream = await core.agendas(req.params.uid).events.search(
    query,
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
    showLinks: false,
  });

  pdfStream.getReadableStream().pipe(res);

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'content-disposition': `attachment; filename="contributors.${req.agenda.title}.pdf"`,
  });

  for await (const event of stream) {
    pdfStream.write(
      convertEventToLegacyFormat({
        uid: req.params.uid,
        slug: req.agenda.slug,
        legacy: { tagSet, categorySet },
        formSchema,
        admin: false,
      }, event),
    );
  }

  pdfStream.end();
};
