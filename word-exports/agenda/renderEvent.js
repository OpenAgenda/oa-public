import { getLocaleValue } from '@openagenda/intl';
import {
  EMU_PER_CM,
  borderlessRow,
  hyperlink,
  inlineImage,
  paragraph,
  run,
} from '../lib/xml.js';
import { TEXT_WIDTH } from '../lib/parts.js';
import messages from '../lib/messages.js';

const accessibilityKeys = ['ii', 'hi', 'vi', 'pi', 'mi'];

// The picture column: a 2.5 cm square and its gutter.
const IMAGE_SIZE = 2.5 * EMU_PER_CM;
const IMAGE_COLUMN_WIDTH = 1700;

export function googleMapsLink(location) {
  const query = [location.name, location.address].filter(Boolean).join(' ');

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
}

function linkOrText(writer, url, text = url) {
  return /^(https?:|mailto:)/.test(url)
    ? hyperlink(writer.link(url), text)
    : run(text);
}

function registrationLine(writer, event, intl) {
  const items = (event.registration ?? [])
    .filter((item) => item?.value)
    .map((item) => {
      if (item.type === 'email') {
        return linkOrText(writer, `mailto:${item.value}`, item.value);
      }
      if (item.type === 'link') {
        return linkOrText(writer, item.value);
      }
      return run(item.value);
    });

  if (!items.length) return null;

  return paragraph(
    [
      run(`${intl.formatMessage(messages.registration)} `),
      items.join(run(' · ')),
    ],
    { style: 'EventDetail' },
  );
}

// The paragraphs of one event, in the order of the PDF items: title,
// description, dates and accessibility, location, online link, registration,
// event page link. `options` says which optional lines to keep.
export function eventParagraphs(writer, event, options) {
  const {
    agenda,
    lang,
    intl,
    includeAccessibility = true,
    includeDescription = true,
    includeEventLink = true,
    includeLocation = true,
    includeRegistration = true,
    // The location is the section the event is in: its heading already
    // says where, the item need not repeat it.
    locationInSection = false,
  } = options;

  const paragraphs = [
    paragraph(run(getLocaleValue(event.title, lang)), { style: 'EventTitle' }),
  ];

  const description = getLocaleValue(event.description, lang);

  if (includeDescription && description) {
    paragraphs.push(paragraph(run(description), { style: 'EventDescription' }));
  }

  const dateRange = getLocaleValue(event.dateRange, lang);

  if (dateRange) {
    paragraphs.push(paragraph(run(dateRange), { style: 'EventDetail' }));
  }

  const accessibilities = accessibilityKeys.filter(
    (key) => event.accessibility?.[key] === true,
  );

  if (includeAccessibility && accessibilities.length) {
    const list = accessibilities
      .map((key) => intl.formatMessage(messages[key]))
      .join(', ');

    paragraphs.push(
      paragraph(run(intl.formatMessage(messages.accessibility, { list })), {
        style: 'EventDetail',
      }),
    );
  }

  const { location } = event;

  if (
    includeLocation
    && !locationInSection
    && (location?.name || location?.address)
  ) {
    const label = [location.name, location.address].filter(Boolean).join(' - ');

    paragraphs.push(
      paragraph(hyperlink(writer.link(googleMapsLink(location)), label), {
        style: 'EventDetail',
      }),
    );
  }

  if (event.onlineAccessLink) {
    paragraphs.push(
      paragraph(linkOrText(writer, event.onlineAccessLink), {
        style: 'EventDetail',
      }),
    );
  }

  if (includeRegistration) {
    const line = registrationLine(writer, event, intl);

    if (line) paragraphs.push(line);
  }

  if (includeEventLink) {
    const url = `https://openagenda.com/${agenda.slug}/events/${event.slug}`;

    paragraphs.push(
      paragraph(hyperlink(writer.link(url), url), { style: 'EventDetail' }),
    );
  }

  return paragraphs;
}

// One event, with its picture beside it when pictures are on. `image` is the
// event's JPEG thumbnail, or null. With pictures on, every item is laid out
// the same way, picture or not, so the texts stay aligned.
export default function renderEvent(writer, event, image, options) {
  const paragraphs = eventParagraphs(writer, event, options);

  if (!options.includeEventImages) {
    return paragraphs.join('');
  }

  let picture = '';

  if (image) {
    const { id, drawingId } = writer.image(image);

    picture = paragraph(
      inlineImage(id, drawingId, {
        size: IMAGE_SIZE,
        description: getLocaleValue(event.title, options.lang),
      }),
    );
  }

  return [
    borderlessRow([
      { width: IMAGE_COLUMN_WIDTH, content: picture },
      { width: TEXT_WIDTH - IMAGE_COLUMN_WIDTH, content: paragraphs },
    ]),
    // Word merges two tables that touch: an empty paragraph keeps the items
    // apart.
    paragraph(''),
  ].join('');
}
