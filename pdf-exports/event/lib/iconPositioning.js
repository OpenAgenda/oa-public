import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import addIcon from '../../utils/addIcon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const icons = {
  email: `${__dirname}/../../images/email.png`,
  phone: `${__dirname}/../../images/phone.png`,
  link: `${__dirname}/../../images/link.png`,
};

const linkPrefixes = {
  email: 'mailto:',
  phone: 'tel:',
};

export default async function iconPositioning(doc, cursor, type, options = {}) {
  const { iconHeightAndWidth, margin, simulate } = options;
  const iconPath = icons[type];
  const linkPrefix = linkPrefixes[type] || '';

  cursor.y += margin / 8;

  if (iconPath) {
    await addIcon(doc, iconPath, cursor, iconHeightAndWidth, { simulate });
    if (!simulate) {
      cursor.x += iconHeightAndWidth + margin / 2;
    }
  }

  cursor.y -= margin / 8;

  return {
    linkPrefix,
    width: iconHeightAndWidth,
    height: iconHeightAndWidth,
  };
}
