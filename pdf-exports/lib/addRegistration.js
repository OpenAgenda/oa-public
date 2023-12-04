import addText from './addText.js';
import addIcon from './addIcon.js';

const addRegistrationItem = async (
  type,
  registrationItem,
  iconPath,
  doc,
  localCursor,
  params = {},
  options = {},
) => {
  const { iconHeightAndWidth, base } = params;

  const { simulate = false } = options;

  const { width: widthOfRegistrationIcon } = await addIcon(
    doc,
    iconPath,
    localCursor,
    iconHeightAndWidth,
    { simulate },
  );

  localCursor.x += widthOfRegistrationIcon + base.margin / 3;
  localCursor.y -= base.margin / 16;

  let linkPrefix = '';
  switch (type) {
    case 'email':
      linkPrefix = 'mailto:';
      break;
    default:
      break;
  }

  const reg = addText(doc, localCursor, registrationItem, {
    underline: false,
    link: type !== 'phone' ? linkPrefix + registrationItem : undefined,
    base,
    simulate,
  });

  const widthOfReg = reg.width;
  const heightOfReg = reg.height;

  localCursor.x += widthOfReg + base.margin / 2;

  return {
    width: widthOfRegistrationIcon + base.margin / 3 + widthOfReg,
    height: heightOfReg,
  };
};

export default async function addRegistration(
  event,
  doc,
  cursor,
  params = {},
  options = {},
) {
  const {
    base,
    iconHeightAndWidth,
    emailIconPath,
    phoneIconPath,
    linkIconPath,
  } = params;
  const { simulate = false, lang } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let widthOfRegistrationLabel = null;
  let heightOfRegistrationLabel = null;
  let widthOfRegistrationItem = null;
  let heightOfRegistrationItem = null;

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
    heightOfRegistrationLabel = addRegistrationLabel.height;

    localCursor.x += widthOfRegistrationLabel + base.margin / 3;
    localCursor.y += base.margin / 16;
  }

  const typesWithIcons = [
    { type: 'email', iconPath: emailIconPath },
    { type: 'phone', iconPath: phoneIconPath },
    { type: 'link', iconPath: linkIconPath },
  ];

  function getTypeAndIconPath(type) {
    const typeWithIcon = typesWithIcons.find(item => item.type === type);
    return {
      type: typeWithIcon.type,
      iconPath: typeWithIcon.iconPath,
    };
  }

  for (const registrationItem of registration) {
    const { type, iconPath } = getTypeAndIconPath(registrationItem.type);
    const reg = await addRegistrationItem(
      type,
      registrationItem.value,
      iconPath,
      doc,
      localCursor,
      {
        iconHeightAndWidth,
        base,
      },
      { simulate },
    );
    widthOfRegistrationItem = reg.width;
    heightOfRegistrationItem = reg.height;
  }

  const totalWidth = widthOfRegistrationLabel + base.margin / 3 + widthOfRegistrationItem;
  const totalHeight = Math.max(
    heightOfRegistrationLabel,
    heightOfRegistrationItem,
  );
  localCursor.y += totalHeight + base.margin / 10;

  return {
    width: totalWidth,
    height: totalHeight,
  };
}
