import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLocaleValue } from '@openagenda/intl';

import addText from './addText.js';
import addIcon from './addIcon.js';
import addRegistration from './addRegistration.js';
import thumbnail from './thumbnail.js';
import generateGoogleMapsLink from './generateGoogleMapsLink.js';
import cleanString from './cleanString.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const locationIconPath = `${__dirname}/../images/location.png`;
const onlineLinkPath = `${__dirname}/../images/onlineLink.png`;
const dateRangeIconPath = `${__dirname}/../images/calendar.png`;
const accessibilityKeys = ['ii', 'hi', 'vi', 'pi', 'mi'];

function goToNextLine(cursor, height, options, includeEventImages) {
  const {
    base = {
      margin: 20,
      color: '#413a42',
    },
    imageWidth,
  } = options;

  cursor.y += height + base.margin / 10;
  if (includeEventImages) {
    cursor.x = imageWidth + base.margin * 2;
  } else {
    cursor.x = base.margin;
  }
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
    intl,
    lang,
    includeEventImages,
    little,
    medium,
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

  if (includeEventImages) {
    columnMaxWidth = doc.page.width - imageWidth - base.margin * 3;
  } else {
    columnMaxWidth = doc.page.width - base.margin * 2;
  }

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

  const { height: titleHeight, width: titleWidth } = addText(
    doc,
    localCursor,
    cleanString(getLocaleValue(event.title, lang)),
    {
      width: columnMaxWidth,
      fontSize,
      base,
      bold: true,
      simulate,
    },
  );
  let columnWidth = titleWidth;

  goToNextLine(
    localCursor,
    titleHeight,
    { options, imageWidth },
    includeEventImages,
  );

  if (event.description.lenght > 0) {
    const { height: descriptionHeight, width: descriptionWidth } = addText(
      doc,
      localCursor,
      cleanString(getLocaleValue(event.description, lang)),
      { width: columnMaxWidth, fontSize, base, simulate },
    );

    columnWidth = Math.max(columnWidth, descriptionWidth);
    goToNextLine(
      localCursor,
      descriptionHeight,
      { options, imageWidth },
      includeEventImages,
    );
  }

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

  localCursor.x += dateRangeWidthIcon + margin;
  localCursor.y -= base.margin / 16;

  const { width: dateRangeWidth, height: dateRangeHeight } = addText(
    doc,
    localCursor,
    getLocaleValue(event.dateRange, lang),
    {
      width: columnMaxWidth - (iconHeightAndWidth + margin),
      fontSize,
      base,
      simulate,
    },
  );

  localCursor.x += dateRangeWidth + base.margin / 4;
  localCursor.y += base.margin / 16;

  let accessibilityHeight = 0;
  const accessibilityWidth = iconsArr.lengh * (iconHeightAndWidth + margin);

  for (const icon of iconsArr) {
    localCursor.x += iconHeightAndWidth + margin;
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
    { options, imageWidth },
    includeEventImages,
  );

  if (event.location?.name || event.location?.address) {
    const { width: widthOfLocationIcon } = addIcon(
      doc,
      locationIconPath,
      localCursor,
      iconHeightAndWidth,
      { simulate },
    );

    localCursor.x += widthOfLocationIcon + margin;
    localCursor.y -= base.margin / 16;

    const googleMapsLink = generateGoogleMapsLink(
      `${event.location.name} ${event.location.address}`,
    );

    const { width: locationWidth, height: locationHeight } = addText(
      doc,
      localCursor,
      cleanString(`${event.location.name} - ${event.location.address}`),
      {
        width: columnMaxWidth - (iconHeightAndWidth + margin),
        fontSize,
        base,
        underline: false,
        link: googleMapsLink,
        simulate,
      },
    );

    columnWidth = Math.max(columnWidth, locationWidth);
    goToNextLine(
      localCursor,
      locationHeight,
      { options, imageWidth },
      includeEventImages,
    );
  }

  if (event.onlineAccessLink) {
    const { width: widthOfOnelineLinkIcon } = addIcon(
      doc,
      onlineLinkPath,
      localCursor,
      iconHeightAndWidth,
      { simulate },
    );

    localCursor.x += widthOfOnelineLinkIcon + margin;
    localCursor.y -= base.margin / 16;

    const { width: onlineAccessLinkWidth, height: onlineAccessLinkHeight } = addText(doc, localCursor, event.onlineAccessLink, {
      width: columnMaxWidth - (iconHeightAndWidth + margin),
      fontSize,
      base,
      underline: false,
      link: event.onlineAccessLink,
      simulate,
    });

    columnWidth = Math.max(columnWidth, onlineAccessLinkWidth);
    goToNextLine(
      localCursor,
      onlineAccessLinkHeight,
      { options, imageWidth },
      includeEventImages,
    );
  }

  if (event.registration.length !== 0 && event.registration.value != null) {
    const { width: registrationWidth, height: registrationHeight } = addRegistration(
      doc,
      event,
      localCursor,
      {
        base,
        iconHeightAndWidth,
        fontSize,
        margin,
      },
      { simulate, intl },
    );

    columnWidth = Math.max(columnWidth, registrationWidth);
    goToNextLine(
      localCursor,
      registrationHeight,
      { options, imageWidth },
      includeEventImages,
    );
  }

  const { width: eventLinkWidth, height: eventLinkHeight } = addText(
    doc,
    localCursor,
    `https://openagenda.com/${agenda.slug}/events/${event.slug}`,
    {
      color: secondaryColor,
      width: columnMaxWidth,
      fontSize,
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
