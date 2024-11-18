import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import addText from './addText.js';
import addIcon from '../../utils/addIcon.js';
import getTruncatedLabel from './getTruncatedLabel.js';
import messages from './messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typesWithIcons = [
  { type: 'email', iconPath: `${__dirname}/../../images/email.png` },
  { type: 'phone', iconPath: `${__dirname}/../../images/phone.png` },
  { type: 'link', iconPath: `${__dirname}/../../images/link.png` },
];

function addRegistrationLabel(doc, cursor, params = {}, options = {}) {
  const { intl, simulate = false } = options;

  const { fontSize } = params;

  return addText(doc, cursor, `${intl.formatMessage(messages.registration)}:`, {
    underline: true,
    fontSize,
    medium: true,
    simulate,
  });
}

function getTypeAndIconPath(type) {
  const typeWithIcon = typesWithIcons.find((item) => item.type === type);
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
  const { base, iconHeightAndWidth, fontSize, margin } = params;

  const { simulate = false } = options;

  let widthOfReg = null;
  let heightOfReg = null;

  localCursor.y += base.margin / 20;

  if (label === null || !registrationItem.type) {
    return {
      width: 0,
      height: 0,
    };
  }

  const { type, iconPath } = getTypeAndIconPath(registrationItem.type);

  addIcon(doc, iconPath, localCursor, iconHeightAndWidth, { simulate });

  localCursor.x += iconHeightAndWidth + margin;

  const linkPrefix = type === 'email' ? 'mailto:' : '';

  localCursor.y -= base.margin / 20;

  const reg = addText(doc, localCursor, label, {
    fontSize,
    underline: false,
    link: type !== 'phone' ? linkPrefix + registrationItem.value : undefined,
    base,
    simulate,
  });

  widthOfReg = reg.width;
  heightOfReg = reg.height;

  return {
    width: iconHeightAndWidth + margin + widthOfReg,
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
  const { base, iconHeightAndWidth, fontSize, margin } = params;

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
    {
      fontSize,
    },
  );

  localCursor.x += widthOfRegistrationLabel + margin;

  const { height: lineHeight } = addText(doc, cursor, '.', {
    fontSize,
    simulate: true,
  });

  let height = lineHeight;

  let remainingWidth = columnWidth - widthOfRegistrationLabel - margin;

  let isMultiline = false;

  for (const [index, registrationItem] of registration.entries()) {
    const truncatedLabel = getTruncatedLabel(
      doc,
      localCursor,
      remainingWidth - iconHeightAndWidth - margin,
      registrationItem.value,
      {
        fontSize,
      },
    );

    if (truncatedLabel.label === null) {
      continue;
    }

    const minRemainingWidth = (truncatedLabel.width + iconHeightAndWidth + margin * 2) / 2;

    const reg = addRegistrationItem(
      doc,
      localCursor,
      truncatedLabel.label,
      registrationItem,
      {
        base,
        iconHeightAndWidth,
        fontSize,
        margin,
      },
      { simulate },
    );

    if (index === registration.length - 1) {
      break;
    }

    const isReachingEndofLine = remainingWidth - reg.width - margin < minRemainingWidth;
    if (!isReachingEndofLine) {
      localCursor.x += truncatedLabel.width + margin;
      remainingWidth = remainingWidth - reg.width - margin;
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
