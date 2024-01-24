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

function getTypeAndIconPath(type) {
  const typeWithIcon = typesWithIcons.find(item => item.type === type);
  return {
    type: typeWithIcon.type,
    iconPath: typeWithIcon.iconPath,
  };
}

const addRegistrationItem = async (
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

  await addIcon(doc, iconPath, localCursor, iconHeightAndWidth, { simulate });

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

export default async function addRegistration(
  event,
  doc,
  cursor,
  params = {},
  options = {},
) {
  const { base, iconHeightAndWidth, imageWidth } = params;
  const { simulate = false, lang } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let widthOfRegistrationLabel = null;

  const { registration = [] } = event;

  const registrationLabel = {
    fr: 'Réservation',
  };

  if (registration.length > 0) {
    const addRegistrationLabel = addText(
      doc,
      localCursor,
      `${registrationLabel[lang]}:`,
      {
        underline: true,
        base,
        medium: true,
        simulate,
      },
    );
    widthOfRegistrationLabel = addRegistrationLabel.width;

    localCursor.x += widthOfRegistrationLabel + base.margin / 3;
  }

  const columnWidth = doc.page.width - imageWidth - base.margin * 3;
  const columnStart = imageWidth + base.margin * 2;

  const { height: lineHeight } = addText(doc, cursor, '.', {
    fontSize: 10,
    simulate: true,
  });

  let globalHeight = lineHeight;

  let remainingWidth = columnWidth - widthOfRegistrationLabel - base.margin / 3;

  for (const [index, registrationItem] of registration.entries()) {
    const truncatedLabel = getTruncatedLabel(
      doc,
      localCursor,
      remainingWidth - iconHeightAndWidth - base.margin / 3,
      registrationItem.value,
    );

    const minRemainingWidth = (truncatedLabel.width + iconHeightAndWidth + (base.margin / 3) * 2) / 2;

    const reg = await addRegistrationItem(
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

    const isLast = index === registration.length - 1;

    if (remainingWidth - reg.width - base.margin / 3 < minRemainingWidth) {
      if (!isLast) {
        localCursor.y += reg.height + base.margin / 16;
        remainingWidth = columnWidth;
        localCursor.x = columnStart;
        globalHeight += reg.height;
      }
      continue;
    }
    localCursor.x += truncatedLabel.width + base.margin / 3;
    remainingWidth = remainingWidth - reg.width - base.margin / 3;
  }

  return {
    width: localCursor.x,
    height: globalHeight,
  };
}
