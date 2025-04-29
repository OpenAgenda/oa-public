import logs from '@openagenda/logs';
import PDFDocument from 'pdfkit';
import addMultipageSegments from './lib/addMultipageSegments.js';
import roundToDecimal from './lib/roundToDecimal.js';
import addHeader from './lib/addHeader.js';

import {
  loadItem,
  additionalFieldValues,
  mapToFieldValuePair,
} from './lib/render.utils.js';

const log = logs('eventRender');

export default async function renderEvent(
  writeStream,
  agenda,
  event,
  options = {},
) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'portrait',
    margin: 7,
  });

  log(
    'created page w:%s,h:%s',
    roundToDecimal(doc.page.width),
    roundToDecimal(doc.page.height),
  );

  const agendaFlatSchemaFields = agenda.schema.fields.reduce(
    (flatFields, field) =>
      (field.schema
        ? flatFields.concat(
          field.schema.fields.map((f) => ({
            ...f,
            field: `${field.field}.${f.field}`,
          })),
        )
        : flatFields.concat(field)),
    [],
  );

  doc.pipe(writeStream);

  const bodyColumn = [
    {
      field: 'status',
      fieldType: 'select',
      hideIfIn: [1],
    },
    {
      field: 'title',
      fieldType: 'text',
      fontSize: '1.4em',
      bold: true,
    },
    {
      field: 'dateRange',
      fieldType: 'text',
    },
    'description',
    'image',
    {
      field: 'longDescription',
      fieldType: 'markdown',
    },
  ]
    .map(loadItem)
    .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event))
    .concat(additionalFieldValues(agendaFlatSchemaFields, event));

  const sidebarColumn = [
    {
      field: 'uid',
      fieldType: 'qr',
      value: `https//openagenda.com/agendas/${agenda.uid}/events/${event.uid}`,
      size: 80,
    },
    {
      field: 'attendanceMode',
      omitLabel: false,
      hideIfIn: [1],
    },
    {
      field: 'onlineAccessLink',
      omitLabel: false,
      displayLabelIfUnset: false,
    },
    {
      field: 'conditions',
      fieldType: 'text',
    },
    {
      field: 'registration',
      fieldType: 'registration',
    },
    {
      fieldType: 'text',
      value: 'À propos du lieu',
      bold: true,
      fontSize: '1.2em',
    },
    {
      field: 'location.name',
      fieldType: 'text',
      bold: true,
    },
    {
      field: 'location.address',
      fieldType: 'text',
    },
    {
      field: 'location.image',
      fieldType: 'image',
    },
    {
      field: 'location.description',
      fieldType: 'text',
      omitLabel: false,
    },
  ]
    .map(loadItem)
    .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event));

  const timingsColumn = [
    {
      field: 'timings',
      fieldType: 'timings',
      relatedValues: ['timezone'],
    },
  ]
    .map(loadItem)
    .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event));

  return addMultipageSegments(
    doc,
    [
      [
        {
          width: 5,
          padding: 0,
          content: bodyColumn,
          contentItemMargin: 5,
        },
        {
          width: 3,
          padding: 0,
          content: sidebarColumn,
          contentItemMargin: 5,
        },
      ],
      [
        {
          width: 1,
          padding: 0,
          contentItemMargin: 5,
          content: timingsColumn,
        },
      ],
    ],
    {
      ...options,
      addHeader: addHeader.bind(null, { agenda, event, padding: 10 }),
    },
  ).then(() => {
    doc.end();
  });
}
