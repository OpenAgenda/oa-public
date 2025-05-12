import logs from '@openagenda/logs';
import PDFDocument from 'pdfkit';
import addMultipageSegments from './lib/addMultipageSegments.js';
import rtd from './lib/roundToDecimal.js';
import addHeader from './lib/addHeader.js';

import {
  loadItem,
  additionalFieldValues,
  mapToFieldValuePair,
  extractAndFlattenSchemaFields,
} from './lib/render.utils.js';

import {
  headGroup,
  locationGroup,
  mainGroup,
  timingsGroup,
  conditionsAndRegistrationGroup,
} from './lib/fields.js';

const log = logs('eventRender');

export default async function renderEvent(
  writeStream,
  agenda,
  event,
  options = {},
) {
  const { lang } = options;

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'portrait',
    margin: 7,
  });
  doc.pipe(writeStream);

  log('created page w:%s,h:%s', rtd(doc.page.width), rtd(doc.page.height));

  const agendaFlatSchemaFields = extractAndFlattenSchemaFields(agenda.schema);

  const head = {
    width: 6,
    padding: 0,
    contentItemMargin: 3,
    content: headGroup
      .map(loadItem)
      .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event)),
  };

  const qr = {
    width: 1,
    padding: 0,
    content: [
      {
        field: 'uid',
        fieldType: 'qr',
        value: `https://openagenda.com/agendas/${agenda.uid}/events/${event.uid}`,
        size: 80,
      },
    ]
      .map(loadItem)
      .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event)),
  };

  const main = {
    width: 5,
    padding: 0,
    contentItemMargin: 3,
    content: mainGroup
      .map(loadItem)
      .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event))
      .concat(additionalFieldValues(agendaFlatSchemaFields, event)),
  };

  const sidebar = {
    width: 3,
    padding: 10,
    contentItemMargin: 3,
    content: conditionsAndRegistrationGroup
      .concat(event.location ? locationGroup(event.location, { lang }) : [])
      .map(loadItem)
      .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event)),
  };

  const eventDocumentSegments = [
    [head, qr],
    [main, sidebar],
  ];

  if (event.timings.length > 1) {
    eventDocumentSegments.push([
      {
        width: 1,
        padding: 0,
        contentItemMargin: 5,
        content: timingsGroup({ lang })
          .map(loadItem)
          .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event)),
      },
    ]);
  }

  return addMultipageSegments(doc, eventDocumentSegments, {
    ...options,
    addHeader: addHeader.bind(null, { agenda, event, padding: 10 }),
  }).then(() => doc.end());
}
