import logs from '@openagenda/logs';
import PDFDocument from 'pdfkit';
import flattenLabel from '../lib/flattenLabel.js';
import addMultipageSegments from './lib/addMultipageSegments.js';
import rtd from './lib/roundToDecimal.js';
import addHeader from './lib/addHeader.js';
import isLandscape from './lib/isLandscape.js';
import sectionTitle from './lib/sectionTitle.js';

import {
  loadItem,
  additionalFieldValues,
  mapToFieldValuePair,
  extractAndFlattenSchemaFields,
  filterUnset,
} from './lib/render.utils.js';

import {
  headGroup,
  locationMain,
  locationCoordinates,
  locationDescriptions,
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

  const imageField = event.image && {
    field: 'image',
    fieldType: 'image',
    relatedValues: [{ from: 'imageCredits', to: 'credits' }],
  };
  const hasLandscapeMainImage = await isLandscape(
    event.image,
    options.imagePath,
  );

  const hasLongLocationDescription = event.location?.description
    && flattenLabel(event.location?.description, lang)?.length > 300;

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
    content: mainGroup({ imageField: hasLandscapeMainImage && imageField })
      .map(loadItem)
      .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event))
      .concat(additionalFieldValues(agendaFlatSchemaFields, event)),
  };

  const locationSectionTitle = sectionTitle('locationDetails', lang);
  const locationImage = {
    field: 'location.image',
    fieldType: 'image',
    relatedValues: [{ from: 'location.imageCredits', to: 'credits' }],
    min: { height: 50 },
  };

  const displayLocationInSidebar = event.location && !hasLongLocationDescription;

  const sidebar = {
    width: 3,
    padding: 10,
    contentItemMargin: 3,
    content: (hasLandscapeMainImage || !imageField ? [] : [imageField])
      .concat(conditionsAndRegistrationGroup)
      .concat(
        displayLocationInSidebar
          ? locationMain({ locationImage, title: locationSectionTitle })
          : [],
      )
      .concat(
        displayLocationInSidebar ? locationCoordinates(event.location) : [],
      )
      .concat(displayLocationInSidebar ? locationDescriptions : [])
      .map(loadItem)
      .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event))
      .filter(filterUnset),
  };

  const eventDocumentSegments = [
    { columns: [head, qr], separator: true },
    { columns: [main, sidebar], separator: true },
  ];

  if (hasLongLocationDescription) {
    eventDocumentSegments.push([
      {
        width: 1,
        contentItemMargin: 3,
        content: [locationSectionTitle]
          .map(loadItem)
          .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event)),
      },
    ]);

    const locationSegment = [
      {
        width: 4,
        padding: event.location.image ? 10 : 0,
        contentItemMargin: 3,
        content: locationMain({})
          .concat(locationCoordinates(event.location))
          .map(loadItem)
          .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event))
          .filter(filterUnset),
      },
    ];

    if (event.location.image) {
      locationSegment.splice(0, 0, {
        width: 2,
        padding: 0,
        contentItemMargin: 0,
        content: [locationImage]
          .map(loadItem)
          .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event))
          .filter(filterUnset),
      });
    }

    eventDocumentSegments.push(locationSegment);

    eventDocumentSegments.push([
      {
        width: 1,
        contentItemMargin: 3,
        content: locationDescriptions
          .map(loadItem)
          .map(mapToFieldValuePair.bind(null, agendaFlatSchemaFields, event))
          .filter(filterUnset),
      },
    ]);
  }

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
