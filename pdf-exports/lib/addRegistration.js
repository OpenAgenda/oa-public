import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import addText from './addText.js';
import addIcon from './addIcon.js';
import getTruncatedLabel from './getTruncatedLabel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typesWithIcons = [
  { type: 'email', iconPath: `${__dirname}/../images/email.png` },
  { type: 'phone', iconPath: `${__dirname}/../images/phone.png` },
  { type: 'link', iconPath: `${__dirname}/../images/link.png` },
];

function addRegistrationLabel(doc, cursor, params = {}, options = {}) {
  const { lang, simulate = false } = options;

  const { base } = params;

  const registrationLabel = {
    fr: 'Réservation',
  };

  return addText(doc, cursor, `${registrationLabel[lang]}:`, {
    underline: true,
    base,
    medium: true,
    simulate,
  });
}

function getTypeAndIconPath(type) {
  const typeWithIcon = typesWithIcons.find(item => item.type === type);
  return {
    type: typeWithIcon.type,
    iconPath: typeWithIcon.iconPath,
  };
}

const addRegistrationItem = (
  doc,
  localCursor,
  label,
  registrationItem,
  params = {},
  options = {},
) => {
  const { base, iconHeightAndWidth } = params;

  const { simulate = false } = options;

  let widthOfReg = null;
  let heightOfReg = null;

  localCursor.y += base.margin / 8;

  const { type, iconPath } = getTypeAndIconPath(registrationItem.type);

  addIcon(doc, iconPath, localCursor, iconHeightAndWidth, { simulate });

  localCursor.x += iconHeightAndWidth + base.margin / 3;

  const linkPrefix = type === 'email' ? 'mailto:' : '';

  localCursor.y -= base.margin / 8;

  const reg = addText(doc, localCursor, label, {
    fontSize: 10,
    underline: false,
    link: type !== 'phone' ? linkPrefix + registrationItem.value : undefined,
    base,
    simulate,
  });

  widthOfReg = reg.width;
  heightOfReg = reg.height;

  return {
    width: iconHeightAndWidth + base.margin / 3 + widthOfReg,
    height: Math.max(iconHeightAndWidth, heightOfReg),
  };
};

export default function addRegistration(
  doc,
  event,
  cursor,
  params = {},
  options = {},
) {
  const { base, iconHeightAndWidth } = params;

  const { simulate = false } = options;

  const columnWidth = doc.page.width - cursor.x - base.margin;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  const { registration = [] } = event;

  if (registration.length === 0) {
    return { width: 0, height: 0 };
  }

  const { width: widthOfRegistrationLabel } = addRegistrationLabel(
    doc,
    localCursor,
    params,
    options,
  );

  localCursor.x += widthOfRegistrationLabel + base.margin / 3;

  const { height: lineHeight } = addText(doc, cursor, '.', {
    fontSize: 10,
    simulate: true,
  });

  let height = lineHeight;

  let remainingWidth = columnWidth - widthOfRegistrationLabel - base.margin / 3;

  let isMultiline = false;

  for (const [index, registrationItem] of registration.entries()) {
    const truncatedLabel = getTruncatedLabel(
      doc,
      localCursor,
      remainingWidth - iconHeightAndWidth - base.margin / 3,
      registrationItem.value,
    );

    const minRemainingWidth = (truncatedLabel.width + iconHeightAndWidth + (base.margin / 3) * 2) / 2;

    const reg = addRegistrationItem(
      doc,
      localCursor,
      truncatedLabel.label,
      registrationItem,
      {
        base,
        iconHeightAndWidth,
      },
      { simulate },
    );

    if (index === registration.length - 1) {
      break;
    }

    const isReachingEndofLine = remainingWidth - reg.width - base.margin / 3 < minRemainingWidth;

    if (!isReachingEndofLine) {
      localCursor.x += truncatedLabel.width + base.margin / 3;
      remainingWidth = remainingWidth - reg.width - base.margin / 3;
      continue;
    }

    isMultiline = true;
    localCursor.y += reg.height + base.margin / 16;
    remainingWidth = columnWidth;
    localCursor.x = cursor.x;
    height += reg.height;
  }

  return {
    width: isMultiline ? columnWidth : localCursor.x - cursor.x,
    height,
  };
}
