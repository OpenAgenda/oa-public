import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import addText from '../addText.js';
import addIcon from '../addIcon.js';
import cleanString from '../cleanString.js';
import generateGoogleMapsLink from '../generateGoogleMapsLink.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const locationIconPath = `${__dirname}/../../images/location.png`;

export default function locationPositioning(doc, cursor, event, options = {}) {
  const {
    columnMaxWidth,
    fontSize,
    base,
    margin,
    iconHeightAndWidth,
    simulate,
    mode,
    ...lineItemOptions
  } = options;

  let locationHeightTotal = 0;

  if (event.location?.name || event.location?.address) {
    const { width: widthOfLocationIcon, height: heightOfLocationIcon } = addIcon(doc, locationIconPath, cursor, iconHeightAndWidth, { simulate });

    cursor.x += widthOfLocationIcon + margin;
    cursor.y -= base.margin / 16;

    const googleMapsLink = generateGoogleMapsLink(
      `${event.location.name} ${event.location.address}`,
    );

    let cityHeight = 0;
    if (mode === 'city' && event.location?.city) {
      const { width: cityWidth, height } = addText(
        doc,
        cursor,
        cleanString(event.location.city),
        {
          width: columnMaxWidth - (iconHeightAndWidth + margin),
          fontSize,
          base,
          bold: lineItemOptions.bold,
          underline: false,
          link: googleMapsLink,
          simulate,
        },
      );
      cursor.x += cityWidth;
      cityHeight = height;
    }

    const locationString = cleanString(
      mode === 'city'
        ? ` - ${event.location?.address} - ${event.location?.name}`
        : `${event.location?.name} - ${event.location?.address}`,
    );

    const { width: locationWidth, height: locationHeight } = addText(
      doc,
      cursor,
      locationString,
      {
        width: columnMaxWidth - (iconHeightAndWidth + margin),
        fontSize,
        base,
        underline: false,
        link: googleMapsLink,
        simulate,
      },
    );

    cursor.x += locationWidth;
    cursor.y += base.margin / 16;

    locationHeightTotal = mode === 'city'
      ? Math.max(heightOfLocationIcon, cityHeight, locationHeight)
      : Math.max(heightOfLocationIcon, locationHeight);
  }

  return {
    width: cursor.x,
    height: locationHeightTotal,
  };
}
