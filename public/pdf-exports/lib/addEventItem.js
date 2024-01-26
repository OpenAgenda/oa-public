import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import addText from './addText.js';
import addIcon from './addIcon.js';
import flattenLabel from './flattenLabel.js';
import addRegistration from './addRegistration.js';
import thumbnail from './thumbnail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const imageWidth = 90;
const imageHeight = 90;
const iconHeightAndWidth = 10;
const locationIconPath = `${__dirname}/../images/location.png`;
const onlineLinkPath = `${__dirname}/../images/onlineLink.png`;
const dateRangeIconPath = `${__dirname}/../images/calendar.png`;
const accessibilityKeys = ['ii', 'hi', 'vi', 'pi', 'mi'];

function goToNextLine(cursor, height, options) {
  const {
    base = {
      margin: 20,
      color: '#413a42',
      fontSize: 10,
    },
  } = options;

  cursor.y += height + base.margin / 10;
  cursor.x = imageWidth + base.margin * 2;
}

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
    lang,
  } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  const columnMaxWidth = doc.page.width - imageWidth - base.margin * 3;

  const iconsArr = [];

  for (const key of accessibilityKeys) {
    if (event.accessibility?.[key] === true) {
      iconsArr.push(`${__dirname}/../images/accessibility/${key}.png`);
    }
  }

  const imageOptions = {
    cover: [imageWidth, imageHeight],
    align: 'center',
    valign: 'center',
  };

  const imageUrl = await thumbnail(event, __dirname, imageWidth, imageHeight);

  if (!simulate && imageUrl) {
    doc.image(imageUrl, cursor.x, cursor.y, imageOptions);
  }

  localCursor.x += imageWidth + base.margin;

  const { height: titleHeight, width: titleWidth } = addText(
    doc,
    localCursor,
    flattenLabel(event.title, { lang }),
    {
      width: columnMaxWidth,
      fontSize: 10,
      base,
      bold: true,
      simulate,
    },
  );

  let columnWidth = titleWidth;
  goToNextLine(localCursor, titleHeight, options);

  const { height: descriptionHeight, width: descriptionWidth } = addText(
    doc,
    localCursor,
    flattenLabel(event.description, { lang }),
    { width: columnMaxWidth, fontSize: 10, base, simulate },
  );

  columnWidth = Math.max(columnWidth, descriptionWidth);
  goToNextLine(localCursor, descriptionHeight, options);

  // date range & accessibility line

  const { width: dateRangeWidthIcon, height: dateRangeIconHeight } = addIcon(
    doc,
    dateRangeIconPath,
    localCursor,
    iconHeightAndWidth,
    {
      simulate,
    },
  );

  localCursor.x += dateRangeWidthIcon + base.margin / 3;
  localCursor.y -= base.margin / 16;

  const { width: dateRangeWidth, height: dateRangeHeight } = addText(
    doc,
    localCursor,
    flattenLabel(event.dateRange, { lang }),
    {
      width: columnMaxWidth - (iconHeightAndWidth + base.margin / 3),
      fontSize: 10,
      base,
      simulate,
    },
  );

  localCursor.x += dateRangeWidth + base.margin / 4;
  localCursor.y += base.margin / 16;

  let accessibilityHeight = 0;
  const accessibilityWidth = iconsArr.lengh * (iconHeightAndWidth + base.margin / 3);

  for (const icon of iconsArr) {
    localCursor.x += iconHeightAndWidth + base.margin / 3;
    const { height: iconHeight } = addIcon(
      doc,
      icon,
      localCursor,
      iconHeightAndWidth,
      {
        simulate,
      },
    );

    accessibilityHeight = Math.max(accessibilityHeight, iconHeight);
  }

  columnWidth = Math.max(
    columnWidth,
    dateRangeWidth + accessibilityWidth + base.margin / 4,
  );
  goToNextLine(
    localCursor,
    Math.max(dateRangeIconHeight, dateRangeHeight, accessibilityHeight),
    options,
  );

  if (event.location.name || event.location.address) {
    const { width: widthOfLocationIcon } = addIcon(
      doc,
      locationIconPath,
      localCursor,
      iconHeightAndWidth,
      { simulate },
    );

    localCursor.x += widthOfLocationIcon + base.margin / 3;
    localCursor.y -= base.margin / 16;

    const { width: locationWidth, height: locationHeight } = addText(
      doc,
      localCursor,
      `${event.location?.name} - ${event.location?.address}`,
      {
        width: columnMaxWidth - (iconHeightAndWidth + base.margin / 3),
        fontSize: 10,
        base,
        underline: false,
        link: 'https://www.google.com',
        simulate,
      },
    );

    columnWidth = Math.max(columnWidth, locationWidth);
    goToNextLine(localCursor, locationHeight, options);
  }

  if (event.onlineAccessLink) {
    const { width: widthOfOnelineLinkIcon } = addIcon(
      doc,
      onlineLinkPath,
      localCursor,
      iconHeightAndWidth,
      { simulate },
    );

    localCursor.x += widthOfOnelineLinkIcon + base.margin / 3;
    localCursor.y -= base.margin / 16;

    const { width: onlineAccessLinkWidth, height: onlineAccessLinkHeight } = addText(doc, localCursor, event.onlineAccessLink, {
      width: columnMaxWidth - (iconHeightAndWidth + base.margin / 3),
      fontSize: 10,
      base,
      underline: false,
      link: event.onlineAccessLink,
      simulate,
    });

    columnWidth = Math.max(columnWidth, onlineAccessLinkWidth);
    goToNextLine(localCursor, onlineAccessLinkHeight, options);
  }

  if (event.registration.length !== 0) {
    const { width: registrationWidth, height: registrationHeight } = addRegistration(
      doc,
      event,
      localCursor,
      {
        base,
        iconHeightAndWidth,
        imageWidth,
      },
      { simulate, lang },
    );

    columnWidth = Math.max(columnWidth, registrationWidth);
    goToNextLine(localCursor, registrationHeight, options);
  }

  const { width: eventLinkWidth, height: eventLinkHeight } = addText(
    doc,
    localCursor,
    `https://openagenda.com/${agenda.slug}/events/${event.slug}`,
    {
      color: secondaryColor,
      width: columnMaxWidth,
      fontSize: 10,
      base,
      underline: false,
      link: `https://openagenda.com/${agenda.slug}/events/${event.slug}`,
      simulate,
    },
  );

  localCursor.y += eventLinkHeight;
  columnWidth = Math.max(columnWidth, eventLinkWidth);

  return {
    width: imageWidth + columnWidth + base.margin,
    height: Math.max(imageHeight, localCursor.y - cursor.y) + base.margin,
    cursor: localCursor,
  };
}
