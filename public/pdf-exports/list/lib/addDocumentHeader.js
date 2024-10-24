import addAgendaLogo from '../../utils/addAgendaLogo.js';
import addText from './addText.js';
import addSeparatorLine from '../../utils/addSeparatorLine.js';
import cleanString from '../../utils/cleanString.js';

export default async function addDocumentHeader(
  agenda,
  firstEvent,
  doc,
  cursor,
  options = {},
) {
  const {
    base = {
      margin: 20,
      color: '#413a42',
    },
    secondaryColor = '#808080',
    little,
    medium,
    mode,
  } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let logoHeight;
  let logoWidth;
  let titleFontSize;
  let fontSize;
  let logoHeightAndWidth;
  let margin;
  let widthOfURL;
  let heightOfURL;

  if (little) {
    titleFontSize = 10;
    fontSize = 8;
    logoHeightAndWidth = 50;
    margin = base.margin / 2;
  } else if (medium) {
    titleFontSize = 12;
    fontSize = 10;
    logoHeightAndWidth = 60;
    margin = base.margin / 2;
  } else {
    // eslint-disable-next-line no-unused-vars
    titleFontSize = 14;
    fontSize = 12;
    logoHeightAndWidth = 70;
    margin = base.margin;
  }

  localCursor.y += margin;

  if (agenda.image) {
    const logo = await addAgendaLogo(
      doc,
      agenda.image,
      localCursor,
      logoHeightAndWidth,
    );

    logoHeight = logo.height;
    logoWidth = logo.width;
    localCursor.x += logo.width + base.margin;
  }
  const textMaxWidth = doc.page.width - logoWidth - base.margin * 3;

  const { height: heightOfTitle, width: widthOfTitle } = addText(
    doc,
    localCursor,
    agenda.title,
    {
      width: textMaxWidth,
      fontSize,
      base,
      bold: true,
    },
  );

  localCursor.y += heightOfTitle + base.margin / 10;

  let widthOfLocation;

  if (mode === 'locationName' && firstEvent) {
    const firstEventLocation = firstEvent.location;

    const { height: heightOfLocation, width: widthLocation } = addText(
      doc,
      localCursor,
      cleanString(`${firstEventLocation.address}`),
      { width: textMaxWidth, fontSize, base },
    );
    localCursor.y += heightOfLocation + base.margin / 10;
    widthOfLocation = widthLocation;
  }

  const { height: heightOfDescription, width: widthOfDescription } = addText(
    doc,
    localCursor,
    agenda.description,
    {
      width: textMaxWidth,
      fontSize,
      base,
    },
  );
  localCursor.y += heightOfDescription + base.margin / 10;

  if (agenda.url) {
    const agendaUrl = addText(doc, localCursor, agenda.url, {
      width: textMaxWidth,
      fontSize,
      base,
      underline: false,
      link: agenda.url,
    });

    heightOfURL = agendaUrl.height;
    widthOfURL = agendaUrl.width;

    localCursor.y += heightOfURL + base.margin / 10;
  }

  const { height: heightOfOaAgendaURL, width: widthOfOaAgendaURL } = addText(
    doc,
    localCursor,
    `https://openagenda.com/${agenda.slug}`,
    {
      color: secondaryColor,
      width: textMaxWidth,
      fontSize,
      base,
      underline: false,
      link: `https://openagenda.com/${agenda.slug}`,
    },
  );

  localCursor.y += heightOfOaAgendaURL;

  const textColHeight = localCursor.y;

  localCursor.y = Math.max(textColHeight, logoHeight + margin) + margin;
  localCursor.x = base.margin * 3;

  const { height: separatorLineHeight } = addSeparatorLine(doc, localCursor, {
    base,
    width: doc.page.width - base.margin * 6,
  });

  localCursor.y += separatorLineHeight;

  return {
    width:
      logoWidth
      + Math.max(
        widthOfTitle,
        widthOfLocation,
        widthOfDescription,
        widthOfURL,
        widthOfOaAgendaURL,
      ),
    height: Math.max(logoHeight, localCursor.y - cursor.y),
    cursor: localCursor,
  };
}
