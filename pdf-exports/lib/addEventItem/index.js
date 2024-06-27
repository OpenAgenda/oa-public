import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import _ from 'lodash';

import thumbnail from '../thumbnail.js';
import goToNextLine from '../goToNextLine.js';

import titlePositioning from './titlePositioning.js';
import descriptionPositioning from './descriptionPositioning.js';
import dateRangePositioning from './dateRangePositioning.js';
import accessibilityPositioning from './accessibilityPositioning.js';
import locationPositioning from './locationPositioning.js';
import onlineAccessLinkPositioning from './onlineAccessLinkPositioning.js';
import registrationPositioning from './registrationPositioning.js';
import eventLinkPositioning from './eventLinkPositioning.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const extractModeOptions = mode =>
  (typeof mode === 'string'
    ? {
      bold: false,
      name: mode,
      margin: { top: 2, bottom: 2 },
    }
    : mode);

const modes = {
  default: [
    'title',
    'description',
    [
      {
        name: 'dateRange',
        margin: { top: 2, bottom: 2 },
      },
      'accessibility',
    ],
    { name: 'location', margin: { top: 2, bottom: 0 } },
    'onlineAccessLink',
    {
      name: 'registration',
      margin: { top: -2, bottom: 0 },
    },
    'eventLink',
  ],
  city: [
    'title',
    { name: 'location', bold: true },
    'dateRange',
    'description',
    'onlineAccessLink',
    {
      name: 'registration',
      margin: { top: -2, bottom: 0 },
    },
    'eventLink',
    'accessibility',
  ],
  locationName: [
    'title',
    'description',
    ['dateRange', 'accessibility'],
    'registration',
    'location',
    'eventLink',
  ],
};

const positioningFunctions = {
  title: titlePositioning,
  location: locationPositioning,
  dateRange: dateRangePositioning,
  description: descriptionPositioning,
  onlineAccessLink: onlineAccessLinkPositioning,
  registration: registrationPositioning,
  eventLink: eventLinkPositioning,
  accessibility: accessibilityPositioning,
};

export default async function addEventItem(
  agenda,
  event,
  doc,
  cursor,
  options = {},
) {
  const {
    base = {
      margin: 20,
      color: '#413a42',
      fontSize: 10,
    },
    secondaryColor = '#808080',
    simulate = false,
    intl,
    lang,
    includeEventImages,
    little,
    medium,
    mode = 'default',
  } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let columnMaxWidth;

  let imageWidth;
  let imageHeight;
  let fontSize;
  let iconHeightAndWidth;
  let margin;

  if (little) {
    imageWidth = 50;
    imageHeight = 50;
    fontSize = 8;
    iconHeightAndWidth = 8;
    margin = base.margin / 5;
  } else if (medium) {
    imageWidth = 70;
    imageHeight = 70;
    fontSize = 9;
    iconHeightAndWidth = 9;
    margin = base.margin / 4;
  } else {
    imageWidth = 90;
    imageHeight = 90;
    fontSize = 10;
    iconHeightAndWidth = 10;
    margin = base.margin / 3;
  }

  const nextLineX = includeEventImages
    ? imageWidth + base.margin * 2
    : base.margin;

  if (includeEventImages) {
    columnMaxWidth = doc.page.width - imageWidth - base.margin * 3;
  } else {
    columnMaxWidth = doc.page.width - base.margin * 2;
  }

  const imageOptions = {
    cover: [imageWidth, imageHeight],
    align: 'center',
    valign: 'center',
  };

  const imageUrl = await thumbnail(event);

  if (!simulate && imageUrl && includeEventImages) {
    const oaLogoPath = `${__dirname}/../images/oaLogo.png`;
    try {
      doc.image(imageUrl, cursor.x, cursor.y, imageOptions);
    } catch (e) {
      doc.image(oaLogoPath, cursor.x, cursor.y, imageOptions);
    }
  }

  if (includeEventImages) {
    localCursor.x += imageWidth + base.margin;
  }

  localCursor.y -= base.margin / 8;

  let columnWidth = 0;

  for (const line of modes[mode]) {
    let lineWidth = 0;
    let lineHeight = 0;
    for (const lineItem of [].concat(line)) {
      const lineItemOptions = extractModeOptions(lineItem);

      if (lineItemOptions.margin?.top) {
        localCursor.y += lineItemOptions.margin.top;
      }

      const { width, height } = positioningFunctions[lineItemOptions.name](
        doc,
        localCursor,
        event,
        {
          columnMaxWidth,
          fontSize,
          base,
          iconHeightAndWidth,
          margin,
          secondaryColor,
          intl,
          simulate,
          lang,
          agenda,
          mode,
          ..._.omit(lineItemOptions, ['margin']),
        },
      );
      lineWidth += width;
      lineHeight = Math.max(
        lineHeight,
        height + (lineItemOptions.margin?.bottom ?? 0),
      );

      localCursor.x = width + base.margin;
    }
    columnWidth = Math.max(columnWidth, lineWidth);

    goToNextLine(localCursor, lineHeight, {
      x: nextLineX,
    });
  }

  return {
    width: imageWidth + columnWidth + base.margin,
    height: Math.max(imageHeight, localCursor.y - cursor.y) + base.margin,
    cursor: localCursor,
  };
}
