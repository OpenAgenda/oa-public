import { getLocaleValue } from '@openagenda/intl';
import logs from '@openagenda/logs';
import DocxWriter, { isReaderGone } from '../lib/DocxWriter.js';
import getIntl from '../lib/intl.js';
import messages from '../lib/messages.js';
import mapOrdered from '../lib/mapOrdered.js';
import defaultThumbnail from '../lib/thumbnail.js';
import { HEADING_LEVELS } from '../lib/styles.js';
import { field, hyperlink, paragraph, run } from '../lib/xml.js';
import renderEvent from './renderEvent.js';
import renderSections, {
  LOCATION_SECTION,
  firstChangedLevel,
  sectionIdentities,
  sectionValues,
} from './renderSections.js';

const log = logs('GenerateExportStream');

// How many events ahead the pictures are fetched.
const IMAGE_LOOKAHEAD = 8;

function documentHeader(writer, agenda, { lang, intl, sections }) {
  const xml = [paragraph(run(agenda.title), { style: 'Title' })];

  const description = getLocaleValue(agenda.description, lang);

  if (description) xml.push(paragraph(run(description)));

  const url = `https://openagenda.com/${agenda.slug}`;

  xml.push(paragraph(hyperlink(writer.link(url), url)));

  if (sections) {
    const depth = Math.min(sections.length, HEADING_LEVELS);

    xml.push(
      paragraph(run(intl.formatMessage(messages.tableOfContents)), {
        style: 'TOCHeading',
      }),
      paragraph(
        field(
          `TOC \\o "1-${depth}" \\h \\z \\u`,
          intl.formatMessage(messages.tableOfContentsPlaceholder),
          { dirty: true },
        ),
      ),
    );
  }

  return xml.join('');
}

// Streams a Word document listing the events of `eventStream`, in their order,
// into `writeStream`. `sections` are the sort keys the events arrive sorted by:
// each one is a level of chapters, with a heading wherever its value changes.
// Resolves once the document is written, or with `interrupted` when the
// reader went away before the end.
export default async function GenerateExportStream(
  config,
  eventStream,
  writeStream,
  options = {},
) {
  const {
    agenda,
    lang = 'fr',
    sections = null,
    includeEventImages = false,
    logBundle,
  } = options;

  // `config.thumbnail` replaces the picture fetch, for tests.
  const { thumbnail = defaultThumbnail } = config;

  const startTime = Date.now();

  let writer = null;
  let count = 0;
  let previousIdentities = null;

  // Everything inside: a failure anywhere, even while setting up, reaches the
  // caller, which answers or cuts the response.
  try {
    const intl = getIntl(lang);

    const renderOptions = {
      ...options,
      lang,
      intl,
      includeEventImages,
      sections,
      locationInSection: !!sections?.includes(LOCATION_SECTION),
    };

    log.info('Start processing', { ...logBundle, sections });

    writer = new DocxWriter(writeStream, {
      title: agenda.title,
      // Right under the deepest section; top level without sections.
      eventTitleLevel: Math.min(sections?.length ?? 0, HEADING_LEVELS),
      updateFields: !!sections,
    });

    await writer.write(documentHeader(writer, agenda, renderOptions));

    const items = mapOrdered(
      eventStream,
      async (event) => ({
        event,
        image: includeEventImages ? await thumbnail(event) : null,
      }),
      includeEventImages ? IMAGE_LOOKAHEAD : 1,
    );

    for await (const { event, image } of items) {
      if (sections) {
        const values = sectionValues(event, sections, lang);
        const identities = sectionIdentities(event, sections, values);
        const level = firstChangedLevel(identities, previousIdentities);

        if (level !== -1) {
          await writer.write(
            renderSections(writer, event, values, level, renderOptions),
          );
        }

        previousIdentities = identities;
      }

      await writer.write(renderEvent(writer, event, image, renderOptions));

      count += 1;
    }

    if (!count) {
      await writer.write(paragraph(run(intl.formatMessage(messages.noEvents))));
    }

    await writer.end();
  } catch (error) {
    // A download cancelled midway is no failure: the reader went away and the
    // event stream was destroyed with the response.
    if (isReaderGone(error, writeStream)) {
      log.info('Generation interrupted', {
        ...logBundle,
        eventsGenerated: count,
      });
      writer?.abort(error);

      return { count, interrupted: true };
    }

    // Logged by the caller, which knows what the failure cost the reader.
    writer?.abort(error);
    throw error;
  }

  log.info('End processing', {
    ...logBundle,
    responseTime: Date.now() - startTime,
    eventsGenerated: count,
  });

  return { count };
}
