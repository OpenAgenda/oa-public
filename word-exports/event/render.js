import { getLocaleValue } from '@openagenda/intl';
import logs from '@openagenda/logs';
import DocxWriter, { isReaderGone } from '../lib/DocxWriter.js';
import getIntl from '../lib/intl.js';
import messages from '../lib/messages.js';
import linkOrText from '../lib/links.js';
import groupTimings from '../lib/timings.js';
import { TEXT_WIDTH } from '../lib/parts.js';
import { EMU_PER_CM, inlineImage, paragraph, run } from '../lib/xml.js';
import {
  fieldValueRuns,
  flattenSchemaFields,
  isMarkdownField,
  isUnset,
  markdownParagraphs,
} from '../lib/fieldValues.js';
import { QR_PIXELS, fetchEventImage, qrCode } from '../lib/eventImage.js';
import { accessibilityText, registrationRuns } from '../lib/eventLines.js';

const log = logs('event/render');

// Twips to EMU: 1 twip is 635 EMU.
const TEXT_WIDTH_EMU = TEXT_WIDTH * 635;
const MAX_IMAGE_HEIGHT_EMU = 14 * EMU_PER_CM;
const QR_SIZE_EMU = 3 * EMU_PER_CM;
const AGENDA_LOGO_HEIGHT_EMU = 0.9 * EMU_PER_CM;
// One pixel at 150 dpi: 914400 EMU per inch.
const EMU_PER_PRINT_PIXEL = 914400 / 150;
const LOCATION_IMAGE_WIDTH_EMU = 8 * EMU_PER_CM;

// The standard fields shown under « Practical information », in this order,
// when the agenda schema has them: it gives their label and reads their value.
// The attendance mode only when it is not the default, on-site one.
const practicalFields = [
  'attendanceMode',
  'onlineAccessLink',
  'conditions',
  'age',
];

// A field's value: a sub-schema field is named `parent.child` and lives at
// that path in the event.
const valueAt = (event, path) =>
  path.split('.').reduce((value, key) => value?.[key], event);

function fieldLabel(field, { lang, intl }) {
  const label = getLocaleValue(field.label, lang) ?? field.field;

  return run(`${intl.formatMessage(messages.fieldLabel, { label })} `, {
    bold: true,
  });
}

// « Label: value » for a field of the agenda schema, or nothing when unset.
function fieldParagraphs(writer, field, value, context) {
  if (isUnset(value)) return '';

  if (isMarkdownField(field)) {
    const markdown = getLocaleValue(value, context.lang);

    return markdown
      ? paragraph(fieldLabel(field, context))
          + markdownParagraphs(writer, markdown, { headingOffset: 2 })
      : '';
  }

  const runs = fieldValueRuns(writer, field, value, context);

  return runs ? paragraph([fieldLabel(field, context), runs]) : '';
}

function picture(
  writer,
  { buffer, width, height, extension },
  maxWidth,
  description,
) {
  const ratio = height / width;
  // Never wider than the picture is at print resolution: a small one is not
  // stretched into a blur.
  let emuWidth = Math.min(
    maxWidth,
    TEXT_WIDTH_EMU,
    width * EMU_PER_PRINT_PIXEL,
  );
  let emuHeight = Math.round(emuWidth * ratio);

  if (emuHeight > MAX_IMAGE_HEIGHT_EMU) {
    emuHeight = MAX_IMAGE_HEIGHT_EMU;
    emuWidth = Math.round(emuHeight / ratio);
  }

  const { id, drawingId } = writer.image(buffer, { extension });

  return paragraph(
    inlineImage(id, drawingId, {
      width: emuWidth,
      height: emuHeight,
      description,
    }),
  );
}

// The agenda above the event: its logo at the height of a line or two of
// text, its name, and its website when it has one.
function agendaHeader(writer, agenda, logo) {
  const content = [];

  if (logo) {
    const { id, drawingId } = writer.image(logo.buffer);

    content.push(
      inlineImage(id, drawingId, {
        width: Math.round((AGENDA_LOGO_HEIGHT_EMU * logo.width) / logo.height),
        height: AGENDA_LOGO_HEIGHT_EMU,
        description: agenda.title ?? '',
      }),
      run(' '),
    );
  }

  if (agenda.title) content.push(run(agenda.title, { bold: true }));

  if (agenda.url) {
    content.push(run(' · '), linkOrText(writer, agenda.url));
  }

  return content.length ? paragraph(content, { style: 'EventDetail' }) : '';
}

function registrationParagraph(writer, event, schemaField, context) {
  const items = registrationRuns(writer, event);

  if (!items) return '';

  const label = schemaField
    ? fieldLabel(schemaField, context)
    : run(`${context.intl.formatMessage(messages.registration)} `, {
      bold: true,
    });

  return paragraph([label, items]);
}

function accessibilityParagraph(event, context) {
  const text = accessibilityText(event, context.intl);

  return text ? paragraph(run(text)) : '';
}

// A location link is a URL, or an object carrying one.
const linkUrl = (link) =>
  (typeof link === 'string' ? link : (link?.link ?? link?.url ?? null));

// Everything the venue record says: its picture, name and address with a map
// link, contact, description, access, tags and links.
function locationSection(writer, location, image, context) {
  const { lang, intl } = context;

  if (!location?.name && !location?.address) return '';

  const xml = [
    paragraph(run(intl.formatMessage(messages.locationDetails)), {
      style: 'Heading1',
    }),
  ];

  if (image) {
    xml.push(
      picture(writer, image, LOCATION_IMAGE_WIDTH_EMU, location.name ?? ''),
    );

    const credits = getLocaleValue(location.imageCredits, lang);

    if (credits) {
      xml.push(
        paragraph(run(intl.formatMessage(messages.credits, { credits })), {
          style: 'Caption',
        }),
      );
    }
  }

  if (location.name) xml.push(paragraph(run(location.name, { bold: true })));
  if (location.address) xml.push(paragraph(run(location.address)));

  if (
    typeof location.latitude === 'number'
    && typeof location.longitude === 'number'
  ) {
    const { latitude: lat, longitude: lng } = location;

    // « See on a map: OpenStreetMap · Google Maps », the reader's choice.
    xml.push(
      paragraph([
        run(
          `${intl.formatMessage(messages.fieldLabel, {
            label: intl.formatMessage(messages.seeOnMap),
          })} `,
        ),
        linkOrText(
          writer,
          `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`,
          'OpenStreetMap',
        ),
        run(' · '),
        linkOrText(
          writer,
          `https://www.google.com/maps?q=${lat},${lng}`,
          'Google Maps',
        ),
      ]),
    );
  }

  const contact = [
    location.website ? linkOrText(writer, location.website) : null,
    location.phone ? run(location.phone) : null,
    location.email
      ? linkOrText(writer, `mailto:${location.email}`, location.email)
      : null,
  ].filter(Boolean);

  if (contact.length) xml.push(paragraph(contact.join(run(' · '))));

  const description = getLocaleValue(location.description, lang);

  if (description) xml.push(paragraph(run(description)));

  const access = getLocaleValue(location.access, lang);

  if (access) xml.push(paragraph(run(intl.formatMessage(messages.access, { access }))));

  const tags = (location.tags ?? [])
    .map((tag) => getLocaleValue(tag?.label, lang))
    .filter((label) => typeof label === 'string' && label);

  if (tags.length) {
    xml.push(
      paragraph(
        run(intl.formatMessage(messages.tags, { list: tags.join(', ') })),
      ),
    );
  }

  const links = (location.links ?? []).map(linkUrl).filter(Boolean);

  xml.push(
    ...links.map((url) =>
      paragraph(linkOrText(writer, url), { style: 'ListItem' })),
  );

  return xml.join('');
}

function timingsSection(event, { lang, intl }) {
  if ((event.timings ?? []).length < 2) return '';

  const months = groupTimings(event.timings, {
    timezone: event.timezone,
    lang,
  });

  return [
    paragraph(run(intl.formatMessage(messages.timingDetails)), {
      style: 'Heading1',
    }),
    ...months.flatMap((month) => [
      paragraph(run(month.label), { style: 'Heading2' }),
      // Not indented: the month headings already group them.
      ...month.days.map((day) =>
        paragraph([
          run(`${day.label} `, { bold: true }),
          run(day.slots.join(', ')),
        ])),
    ]),
  ].join('');
}

// Writes one event as a Word document into `writeStream`: what the event PDF
// shows, as text a reader can edit. Resolves once the document is written.
export default async function renderEvent(
  config,
  writeStream,
  agenda,
  event,
  options = {},
) {
  const { lang = 'fr', imagePath } = options;
  const { fetchImage = fetchEventImage } = config;

  const intl = getIntl(lang);
  const context = { lang, intl };
  const schemaFields = flattenSchemaFields(agenda.schema);
  const schemaField = (name) => schemaFields.find((f) => f.field === name);
  const eventUrl = `https://openagenda.com/agendas/${agenda.uid}/events/${event.uid}`;
  const title = getLocaleValue(event.title, lang);

  // Fetched before the first byte: the document then streams without pause.
  const [agendaLogo, image, locationImage, qr] = await Promise.all([
    agenda.image ? fetchImage(agenda.image, { imagePath }) : null,
    event.image ? fetchImage(event.image, { imagePath }) : null,
    // Only for a venue the document shows: one with a name or an address.
    event.location?.image && (event.location.name || event.location.address)
      ? fetchImage(event.location.image, { imagePath })
      : null,
    qrCode(eventUrl),
  ]);

  const writer = new DocxWriter(writeStream, { title, updateFields: false });

  try {
    const xml = [];

    xml.push(agendaHeader(writer, agenda, agendaLogo));

    // Rescheduled, moved online, full, cancelled: said before anything else.
    const statusOption = event.status !== 1
      && schemaField('status')?.options?.find((o) => o.id === event.status);

    if (statusOption) {
      xml.push(
        paragraph(
          run(getLocaleValue(statusOption.label, lang), { bold: true }),
        ),
      );
    }

    xml.push(paragraph(run(title), { style: 'Title' }));

    const dateRange = getLocaleValue(event.dateRange, lang);

    if (dateRange) xml.push(paragraph(run(dateRange), { style: 'EventDetail' }));

    const description = getLocaleValue(event.description, lang);

    if (description) {
      xml.push(paragraph(run(description), { style: 'EventDescription' }));
    }

    if (image) {
      xml.push(picture(writer, image, TEXT_WIDTH_EMU, title));

      const credits = getLocaleValue(event.imageCredits, lang);

      if (credits) {
        xml.push(
          paragraph(run(intl.formatMessage(messages.credits, { credits })), {
            style: 'Caption',
          }),
        );
      }
    }

    xml.push(
      markdownParagraphs(writer, getLocaleValue(event.longDescription, lang), {
        headingOffset: 1,
      }),
    );

    // The agenda's and the network's own fields, in a section of their own
    // like the practical information and the venue, when any is set.
    const additional = schemaFields
      .filter(({ schemaType }) => ['network', 'agenda'].includes(schemaType))
      .map((field) =>
        fieldParagraphs(writer, field, valueAt(event, field.field), context))
      .filter(Boolean);

    if (additional.length) {
      xml.push(
        paragraph(run(intl.formatMessage(messages.additionalValues)), {
          style: 'Heading1',
        }),
        ...additional,
      );
    }

    const practical = [
      ...practicalFields
        .map(schemaField)
        .filter(
          (field) =>
            field
            && !(field.field === 'attendanceMode' && event.attendanceMode === 1),
        )
        .map((field) =>
          fieldParagraphs(writer, field, valueAt(event, field.field), context)),
      accessibilityParagraph(event, context),
      registrationParagraph(
        writer,
        event,
        schemaField('registration'),
        context,
      ),
    ].filter(Boolean);

    if (practical.length) {
      xml.push(
        paragraph(run(intl.formatMessage(messages.practicalInformation)), {
          style: 'Heading1',
        }),
        ...practical,
      );
    }

    xml.push(locationSection(writer, event.location, locationImage, context));
    xml.push(timingsSection(event, context));

    xml.push(
      paragraph(''),
      picture(
        writer,
        { buffer: qr, width: QR_PIXELS, height: QR_PIXELS, extension: 'png' },
        QR_SIZE_EMU,
        eventUrl,
      ),
      paragraph(
        [
          run(`${intl.formatMessage(messages.eventPage)} `),
          linkOrText(writer, eventUrl),
        ],
        {
          style: 'EventDetail',
        },
      ),
    );

    await writer.write(xml.join(''));
    await writer.end();
  } catch (error) {
    // The reader went away, while the pictures were fetched or midway.
    if (isReaderGone(error)) {
      log.info('Event document interrupted', {
        agendaUid: agenda.uid,
        eventUid: event.uid,
      });
      writer.abort(error);

      return { interrupted: true };
    }

    // Nothing sent yet, the caller can still answer with an error: the
    // response is only cut when the document had started.
    writer.abort(error, { onlyIfStarted: true });
    throw error;
  }

  return { interrupted: false };
}
