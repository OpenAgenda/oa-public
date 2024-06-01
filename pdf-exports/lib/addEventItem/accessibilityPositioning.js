import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import addIcon from '../addIcon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function accessibilityPositioning(
  doc,
  cursor,
  event,
  options = {},
) {
  const { simulate, iconHeightAndWidth, margin } = options;

  const iconsArr = [];

  const accessibilityKeys = ['ii', 'hi', 'vi', 'pi', 'mi'];

  for (const key of accessibilityKeys) {
    if (event.accessibility?.[key] === true) {
      iconsArr.push(`${__dirname}/../../images/accessibility/${key}.png`);
    }
  }

  let accessibilityHeight = 0;

  iconsArr.forEach((icon, index) => {
    if (index > 0) {
      cursor.x += iconHeightAndWidth + margin;
    }
    const { height: iconHeight } = addIcon(
      doc,
      icon,
      cursor,
      iconHeightAndWidth,
      {
        simulate,
      },
    );

    accessibilityHeight = Math.max(accessibilityHeight, iconHeight);
  });

  return {
    width: iconsArr.length * (iconHeightAndWidth + margin),
    height: accessibilityHeight,
  };
}
