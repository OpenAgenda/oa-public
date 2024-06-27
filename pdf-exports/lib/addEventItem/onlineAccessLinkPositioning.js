import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import addText from '../addText.js';
import addIcon from '../addIcon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const onlineLinkPath = `${__dirname}/../../images/onlineLink.png`;

export default function onlineAccessLinkPositioning(
  doc,
  cursor,
  event,
  options = {},
) {
  const {
    columnMaxWidth,
    fontSize,
    base,
    iconHeightAndWidth,
    secondaryColor,
    margin,
    simulate,
  } = options;

  if (event.onlineAccessLink) {
    const { width: widthOfOnlineLinkIcon, height: heightOfOnLineIcon } = addIcon(doc, onlineLinkPath, cursor, iconHeightAndWidth, { simulate });

    cursor.x += widthOfOnlineLinkIcon + margin;
    cursor.y -= base.margin / 20;

    const { width: onlineAccessLinkWidth, height: onlineAccessLinkHeight } = addText(doc, cursor, event.onlineAccessLink, {
      width: columnMaxWidth - (iconHeightAndWidth + margin),
      fontSize,
      base,
      underline: false,
      color: secondaryColor,
      link: event.onlineAccessLink,
      simulate,
    });

    cursor.x += onlineAccessLinkWidth;
    cursor.y += base.margin / 20;

    return {
      width: cursor.x,
      height: Math.max(heightOfOnLineIcon, onlineAccessLinkHeight),
    };
  }
  return {
    width: 0,
    height: 0,
  };
}
