import { getLocaleValue } from '@openagenda/intl';
import { paragraph, run } from '../lib/xml.js';
import linkOrText from '../lib/links.js';
import { HEADING_LEVELS } from '../lib/styles.js';
import messages from '../lib/messages.js';

export const LOCATION_SECTION = 'location.name';

// The event's value for each section key, in the export language: a
// multilingual value is compared, and shown, in that language. Empty is null.
export function sectionValues(event, sections, lang) {
  return sections.map((key) => {
    const value = getLocaleValue(
      key.split('.').reduce((v, prop) => v?.[prop], event),
      lang,
    );

    return value === undefined || value === '' ? null : value;
  });
}

// What tells two sections apart: the value, except for places, where two
// venues can share a name (two « Médiathèque » in two towns) while the details
// under the heading are one venue's.
export function sectionIdentities(event, sections, values) {
  return sections.map((key, index) =>
    (key === LOCATION_SECTION && event.location?.uid
      ? `${values[index]}|${event.location.uid}`
      : values[index]));
}

// The first level whose identity differs from the previous event's, or -1
// when the event stays in the same section. The events arrive sorted by the
// section keys, so a change at one level opens a new section at every level
// below it.
export function firstChangedLevel(identities, previous) {
  if (!previous) return 0;

  return identities.findIndex((value, index) => value !== previous[index]);
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
      ? linkOrText(writer, `mailto:${location.email}`, location.email)
      : null,
    location.website ? linkOrText(writer, location.website) : null,
  ].filter(Boolean);

  if (contact.length) lines.push(contact.join(run(' · ')));

  return lines.map((line) => paragraph(line, { style: 'LocationDetail' }));
}

// The headings an event opens, from the first level that changed down to the
// deepest one. A level with no value (an event without a department, an
// online event under place sections) opens an « Unspecified » heading, so its
// events do not read as the end of the previous chapter. Under a place
// heading come the details of the place.
export default function renderSections(
  writer,
  event,
  values,
  fromLevel,
  options,
) {
  const { sections, includeLocation = true, intl } = options;

  const xml = [];

  for (let level = fromLevel; level < sections.length; level += 1) {
    const value = values[level];

    xml.push(
      paragraph(run(value ?? intl.formatMessage(messages.unspecified)), {
        style: `Heading${Math.min(level + 1, HEADING_LEVELS)}`,
      }),
    );

    if (
      value !== null
      && sections[level] === LOCATION_SECTION
      && includeLocation
      && event.location
    ) {
      xml.push(...locationDetails(writer, event.location, options));
    }
  }

  return xml.join('');
}
