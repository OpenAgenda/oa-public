import logs from '@openagenda/logs';
import addAgendaLogo from '../../utils/addAgendaLogo.js';
import addSeparatorLine from '../../utils/addSeparatorLine.js';
import cleanString from '../../utils/cleanString.js';
import addText from './addText.js';

const log = logs('addDocumentHeader');

export default async function addDocumentHeader(
  agenda,
  firstEvent,
  doc,
  cursor,
  options = {},
) {
  log('processing');
  const {
    base = {
      margin: 20,
      color: '#413a42',
    },
    secondaryColor = '#808080',
    little,
    medium,
    mode,
    displaySeparator = true,
  } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let logoHeight = 0;
  let logoWidth = 0;
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
  log('font sizes, margins and logo dimensions are defined', {
    titleFontSize,
    fontSize,
    logoHeightAndWidth,
    margin,
  });

  localCursor.y += margin;

  if (agenda.image) {
    const logo = await addAgendaLogo(
      doc,
      agenda.image,
      localCursor,
      logoHeightAndWidth,
    );
    log('logo dimensions', logo);

    logoHeight = logo.height;
    logoWidth = logo.width;
    localCursor.x += logo.width + base.margin;
  }
  const textMaxWidth = doc.page.width - logoWidth - base.margin * 3;
  log('textMaxWidth is %s', textMaxWidth);

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
    log('fetching location name');
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

  log('adding agenda description');
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
    log('defining dimensions of agenda URL');
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

  log('writing agenda URL to document for a max width of %s', textMaxWidth);
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

  localCursor.x = base.margin * 3;

  if (displaySeparator) {
    log('adding separator');
    localCursor.y = Math.max(textColHeight, logoHeight + margin) + margin;
    const { height: separatorLineHeight } = addSeparatorLine(doc, localCursor, {
      base,
      width: doc.page.width - base.margin * 6,
    });

    localCursor.y += separatorLineHeight;
  }

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
