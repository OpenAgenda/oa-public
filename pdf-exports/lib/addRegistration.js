import addText from './addText.js';
import addIcon from './addIcon.js';

export default async function addRegistration(
  event,
  doc,
  cursor,
  lang,
  base,
  iconHeightAndWidth,
  widthOfReg,
  heightOfReg,
  emailIconPath,
  phoneIconPath,
  linkIconPath,
  options = {},
) {
  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let widthOfRegistrationLabel = null;

  const registrationLabel = {
    fr: 'Réservation',
  };

  const { simulate = false } = options;

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
  localCursor.y += base.margin / 16;

  const registration = async (type, value, iconPath) => {
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

    const reg = addText(doc, localCursor, value, {
      underline: false,
      link: type !== 'phone' ? linkPrefix + value : undefined,
      base,
      simulate,
    });

    widthOfReg[type] = reg.width;
    heightOfReg[type] = reg.height + base.margin / 10;

    localCursor.x += widthOfReg[type] + base.margin / 2;
  };

  const typesWithIcons = [
    { type: 'email', iconPath: emailIconPath },
    { type: 'phone', iconPath: phoneIconPath },
    { type: 'link', iconPath: linkIconPath },
  ];

  for (const { type, iconPath } of typesWithIcons) {
    const matchingEvents = event.registration.filter(obj => obj.type === type);
    if (matchingEvents.length > 0) {
      for (const { value } of matchingEvents) {
        await registration(type, value, iconPath);
      }
    }
  }

  const existingTypes = typesWithIcons
    .filter(({ type }) => heightOfReg[type] !== undefined)
    .map(({ type }) => type);

  const totalHeightOfReg = Math.max(
    ...existingTypes.map(type => heightOfReg[type]),
  );
  const totalWidthOfReg = existingTypes.reduce(
    (totalWidth, type) => totalWidth + widthOfReg[type],
    0,
  );
  const totalIconWidth = existingTypes.reduce(
    (totalWidth, _type) => totalWidth + iconHeightAndWidth,
    0,
  );
  const totalMarginWidth = (base.margin / 2) * (existingTypes.length - 1);

  localCursor.y += totalHeightOfReg + base.margin / 10;

  return {
    width:
      widthOfRegistrationLabel
      + totalWidthOfReg
      + totalIconWidth
      + totalMarginWidth,
    height: totalHeightOfReg,
    cursor: localCursor,
  };
}
