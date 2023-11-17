import urlToBuffer from './urlToBuffer.js';
import addText from './addText.js';
import addIcon from './addIcon.js';
import flattenLabel from './flattenLabel.js';

export default async function addEventItem(
  agenda,
  event,
  lang,
  doc,
  cursor,
  options = {},
) {
  const {
    base = {
      margin: 20,
      color: '#413a42',
      fontFamily: 'Helvetica',
      fontSize: 10,
    },
    titleFontFamily = 'Helvetica-Bold',
    secondaryColor = '#808080',
    simulate = false,
  } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let widthOfIcon = null;
  let heightOfTitle = null;
  let widthOfTitle = null;
  let heightOfDescription = null;
  let widthOfDescription = null;
  let widthOfDateRange = null;
  let heightOfDateRange = null;
  let widthOfLocation = null;
  let heightOfLocation = 0;
  let widthOfOnlineLink = null;
  let heightOfOnlineLink = null;
  let widthOfRegistration = null;
  let heightOfRegistration = null;
  let widthOfEventLink = null;
  let heightOfEventLink = null;

  const imageWidth = 90;
  const imageHeight = 90;

  const iconHeightAndWidth = 10;

  const textMaxWidth = doc.page.width - imageWidth - base.margin * 3;

  const locationIconPath = './images/location.png';
  const onlineLinkPath = './images/onlineLink.png';
  const dateRangeIconPath = './images/calendar.png';

  const iconsArr = [];

  const accessibilityKeys = ['ii', 'hi', 'vi', 'pi', 'mi'];

  for (const key of accessibilityKeys) {
    if (event.accessibility?.[key] === true) {
      iconsArr.push(`./images/accessibility/${key}.png`);
    }
  }

  const thumbnailFilename = event.image.variants.find(
    el => el.type === 'thumbnail',
  ).filename;
  const imageUrl = await urlToBuffer(event.image.base + thumbnailFilename);

  const imageOptions = {
    cover: [imageWidth, imageHeight],
    align: 'center',
    valign: 'center',
  };

  if (!simulate) {
    doc.image(imageUrl, cursor.x, cursor.y, imageOptions);
  }

  localCursor.x += imageWidth + base.margin;

  const title = addText(doc, localCursor, flattenLabel(event.title, lang), {
    width: textMaxWidth,
    fontSize: 10,
    base,
    fontFamily: titleFontFamily,
    simulate,
  });

  heightOfTitle = title.height;
  widthOfTitle = title.width;

  localCursor.y += heightOfTitle + base.margin / 10;

  const description = addText(
    doc,
    localCursor,
    flattenLabel(event.description, lang),
    { width: textMaxWidth, fontSize: 10, base, simulate },
  );

  widthOfDescription = description.width;
  heightOfDescription = description.height;

  localCursor.y += heightOfDescription + base.margin / 10;

  const { width: widthOfDateRangeIcon } = await addIcon(
    doc,
    dateRangeIconPath,
    localCursor,
    iconHeightAndWidth,
    { simulate },
  );
  localCursor.x += widthOfDateRangeIcon + base.margin / 10;
  localCursor.y += base.margin / 14;

  const dateRange = addText(
    doc,
    localCursor,
    flattenLabel(event.dateRange, lang),
    { width: textMaxWidth, fontSize: 10, base, simulate },
  );

  widthOfDateRange = dateRange.width;
  heightOfDateRange = dateRange.height;

  localCursor.x += widthOfDateRange + base.margin / 4;

  for (const icon of iconsArr) {
    localCursor.x += iconHeightAndWidth + base.margin / 3;
    const iconItem = await addIcon(doc, icon, localCursor, iconHeightAndWidth, {
      simulate,
    });
    widthOfIcon = iconItem.width;
  }

  localCursor.y += heightOfDateRange + base.margin / 10;
  localCursor.x = imageWidth + base.margin * 2;

  if (event.location.name || event.location.address) {
    const { width: widthOfLocationIcon } = await addIcon(
      doc,
      locationIconPath,
      localCursor,
      iconHeightAndWidth,
      { simulate },
    );
    localCursor.x += widthOfLocationIcon + base.margin / 10;
    localCursor.y += base.margin / 14;

    const location = addText(
      doc,
      localCursor,
      `${event.location?.name} - ${event.location?.address}`,
      {
        width: textMaxWidth,
        fontSize: 10,
        base,
        underline: false,
        link: 'https://www.google.com',
        simulate,
      },
    );
    widthOfLocation = location.width;
    heightOfLocation = location.height;
    localCursor.y += heightOfLocation + base.margin / 10;
  }

  localCursor.x = imageWidth + base.margin * 2;

  if (event.onlineAccessLink) {
    const { width: widthOfOnelineLinkIcon } = await addIcon(
      doc,
      onlineLinkPath,
      localCursor,
      iconHeightAndWidth,
      { simulate },
    );

    localCursor.x += widthOfOnelineLinkIcon + base.margin / 3;
    localCursor.y += base.margin / 14;

    const onlineLink = addText(doc, localCursor, event.onlineAccessLink, {
      width: textMaxWidth,
      fontSize: 10,
      base,
      underline: false,
      link: event.onlineAccessLink,
      simulate,
    });
    widthOfOnlineLink = onlineLink.width;
    heightOfOnlineLink = onlineLink.height;
    localCursor.y += heightOfOnlineLink + base.margin / 10;
  }

  localCursor.x = imageWidth + base.margin * 2;

  event.registration
    .filter(obj => obj.type === 'email')
    .forEach(({ value: email }) => {
      const registration = addText(doc, localCursor, email, {
        width: textMaxWidth,
        fontSize: 10,
        base,
        simulate,
      });
      widthOfRegistration = registration.width;
      heightOfRegistration = registration.height;
      localCursor.y += heightOfRegistration + base.margin / 10;
    });

  const eventLink = addText(
    doc,
    localCursor,
    `https://openagenda.com/${agenda.slug}/events/${event.slug}`,
    {
      color: secondaryColor,
      width: textMaxWidth,
      fontSize: 10,
      base,
      underline: false,
      link: `https://openagenda.com/${agenda.slug}/events/${event.slug}`,
      simulate,
    },
  );
  widthOfEventLink = eventLink.width;
  heightOfEventLink = eventLink.height;
  localCursor.y += heightOfEventLink;

  const itemHeight = Math.max(imageHeight, localCursor.y - cursor.y) + base.margin;

  return {
    width:
      imageWidth
      + Math.max(
        widthOfTitle,
        widthOfDescription,
        widthOfDateRange + base.margin + widthOfIcon,
        widthOfLocation,
        widthOfOnlineLink,
        widthOfRegistration,
        widthOfEventLink,
      )
      + base.margin,
    height: itemHeight,
    cursor: localCursor,
  };
}
