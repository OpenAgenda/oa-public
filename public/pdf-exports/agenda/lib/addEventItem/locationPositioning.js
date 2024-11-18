import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import addText from '../addText.js';
import addIcon from '../../../utils/addIcon.js';
import cleanString from '../../../utils/cleanString.js';
import generateGoogleMapsLink from '../generateGoogleMapsLink.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const locationIconPath = `${__dirname}/../../../images/location.png`;

export default function locationPositioning(doc, cursor, event, options = {}) {
  const {
    columnMaxWidth,
    fontSize,
    base,
    margin,
    iconHeightAndWidth,
    simulate,
  } = options;

  let locationHeightTotal = 0;

  if (event.location?.name || event.location?.address) {
    const { width: widthOfLocationIcon, height: heightOfLocationIcon } = addIcon(doc, locationIconPath, cursor, iconHeightAndWidth, { simulate });

    cursor.x += widthOfLocationIcon + margin;
    cursor.y -= base.margin / 16;

    const locationString = event.location.name && event.location.address
      ? `${event.location.name} - ${event.location.address}`
      : event.location.name || event.location.address;

    const googleMapsLink = event.location.name && event.location.address
      ? `${event.location.name} ${event.location.address}`
      : event.location.name || event.location.address;

    const { width: locationWidth, height: locationHeight } = addText(
      doc,
      cursor,
      cleanString(locationString),
      {
        width: columnMaxWidth - (iconHeightAndWidth + margin),
        fontSize,
        base,
        underline: false,
        link: generateGoogleMapsLink(googleMapsLink),
        simulate,
      },
    );

    cursor.x += locationWidth;
    cursor.y += base.margin / 16;

    locationHeightTotal = Math.max(heightOfLocationIcon, locationHeight);
  }

  return {
    width: cursor.x,
    height: locationHeightTotal,
  };
}
