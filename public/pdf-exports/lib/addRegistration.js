import addText from './addText.js';
import addIcon from './addIcon.js';

const addRegistrationItem = async (
  type,
  registration,
  iconPath,
  doc,
  localCursor,
  params = {},
  options = {},
) => {
  const {
    iconHeightAndWidth,
    base,
  } = params;

  const { simulate = false } = options;

  let widthOfRegistrationIcon = null;
  let widthOfReg = null;
  let heightOfReg = null;

  const registrationIcon = await addIcon(
    doc,
    iconPath,
    localCursor,
    iconHeightAndWidth,
    { simulate },
  );
  widthOfRegistrationIcon = registrationIcon.width;

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

  const simulateReg = addText(doc, localCursor, registration.label, {
    fontSize: 10,
    underline: false,
    link: type !== 'phone' ? linkPrefix + registration.value : undefined,
    base,
    simulate: true,
  });
  const simulatewidthOfReg = simulateReg.width;

  const reg = addText(doc, localCursor, registration.label, {
    width: simulatewidthOfReg + base.margin / 3,
    fontSize: 10,
    underline: false,
    link: type !== 'phone' ? linkPrefix + registration.value : undefined,
    base,
    simulate,
  });

  widthOfReg = reg.width;
  heightOfReg = reg.height;

  localCursor.x += widthOfReg + base.margin / 2;

  return {
    width: widthOfRegistrationIcon + base.margin / 3 + widthOfReg,
    height: heightOfReg,
  };
};

export async function simulateAddRegistration(
  registration,
  doc,
  cursor,
  params = {},
) {
  const {
    base,
    iconHeightAndWidth,
    emailIconPath,
    phoneIconPath,
    linkIconPath,
    textMaxWidth,
  } = params;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

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

  const { type, iconPath } = getTypeAndIconPath(registration.type);

  const simulateReg = await addRegistrationItem(
    type,
    registration,
    iconPath,
    doc,
    localCursor,
    {
      iconHeightAndWidth,
      base,
      textMaxWidth,
    },
    { simulate: true },
  );

  return {
    width: simulateReg.width,
    height: simulateReg.height,
  };
}

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
    textMaxWidth,
  } = params;
  const { simulate = false, lang } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let widthOfRegistrationLabel = null;
  let heightOfRegistrationLabel = null;

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

  let totalWidth = null;
  let totalHeight = heightOfRegistrationLabel;

  for (const [index, registrationItem] of registration.entries()) {
    registrationItem.label = registrationItem.value;

    const isFirstItemOnLine = localCursor.x === widthOfRegistrationLabel + base.margin / 3;

    const {
      width: simulateItemsWidth,
      height: simulateItemsHeight,
    } = await simulateAddRegistration(registrationItem, doc, localCursor, params);

    const isTooLong = localCursor.x + simulateItemsWidth + base.margin / 3 > textMaxWidth;

    if (isTooLong) {
      if (!isFirstItemOnLine) {
        localCursor.x = widthOfRegistrationLabel + base.margin / 3;
        localCursor.y += simulateItemsHeight + base.margin / 16;
        totalHeight += simulateItemsHeight + base.margin / 16;
      }

      while (true) {
        registrationItem.label = `${registrationItem.label.slice(0, -2)}…`;

        const { width } = await simulateAddRegistration(registrationItem, doc, localCursor, params);

        if (localCursor.x + width + base.margin / 3 <= textMaxWidth) {
          break;
        }
      }
    }

    const { type, iconPath } = getTypeAndIconPath(registrationItem.type);
    await addRegistrationItem(
      type,
      registrationItem,
      iconPath,
      doc,
      localCursor,
      {
        iconHeightAndWidth,
        base,
        textMaxWidth,
      },
      { simulate },
    );

    const isLast = index === registration.length - 1;

    if (isTooLong && !isLast) {
      localCursor.x = widthOfRegistrationLabel + base.margin / 3;
      localCursor.y += simulateItemsHeight + base.margin / 16;
      totalHeight += simulateItemsHeight + base.margin / 16;
    }
  }

  return {
    width: totalWidth,
    height: totalHeight,
  };
}
