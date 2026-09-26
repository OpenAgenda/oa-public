import { getLocaleValue } from '@openagenda/intl';
import { hyperlink, paragraph, run } from '../lib/xml.js';
import { HEADING_LEVELS } from '../lib/styles.js';
import messages from '../lib/messages.js';

export const LOCATION_SECTION = 'location.name';

// The event's value for each section key, in the export language: a
// multilingual value is compared, and shown, in that language.
export function sectionValues(event, sections, lang) {
  return sections.map((key) => {
    const value = key.split('.').reduce((v, prop) => v?.[prop], event);

    return getLocaleValue(value, lang) ?? null;
  });
}

// The first level whose value differs from the previous event's, or -1 when
// the event stays in the same section. The events arrive sorted by the section
// keys, so a change at one level opens a new section at every level below it.
export function firstChangedLevel(values, previous) {
  if (!previous) return 0;

  return values.findIndex((value, index) => value !== previous[index]);
}

function locationDetails(writer, location, { lang, intl }) {
  const lines = [];

  if (location.address) {
    lines.push(run(location.address));
  }

  const description = getLocaleValue(location.description, lang);

  if (description) lines.push(run(description));

  const access = getLocaleValue(location.access, lang);

  if (access) {
    lines.push(run(intl.formatMessage(messages.access, { access })));
  }

  const contact = [
    location.phone ? run(location.phone) : null,
    location.email
      ? hyperlink(writer.link(`mailto:${location.email}`), location.email)
      : null,
    /^https?:/.test(location.website ?? '')
      ? hyperlink(writer.link(location.website), location.website)
      : null,
  ].filter(Boolean);

  if (contact.length) lines.push(contact.join(run(' · ')));

  return lines.map((line) => paragraph(line, { style: 'LocationDetail' }));
}

// The headings an event opens, from the first level that changed down to the
// deepest one. A level with no value (an event without a department) opens no
// heading. Under a location heading come the details of the place.
export default function renderSections(
  writer,
  event,
  values,
  fromLevel,
  options,
) {
  const { sections, includeLocation = true } = options;

  const xml = [];

  for (let level = fromLevel; level < sections.length; level += 1) {
    const value = values[level];

    if (value !== null && value !== '') {
      xml.push(
        paragraph(run(value), {
          style: `Heading${Math.min(level + 1, HEADING_LEVELS)}`,
        }),
      );

      if (
        sections[level] === LOCATION_SECTION
        && includeLocation
        && event.location
      ) {
        xml.push(...locationDetails(writer, event.location, options));
      }
    }
  }

  return xml.join('');
}
