import addAgendaLogo from './addAgendaLogo.js';
import addText from './addText.js';
import addSeparatorLine from './addSeparatorLine.js';

export default async function addDocumentHeader(
  agenda,
  doc,
  cursor,
  options = {},
) {
  const {
    base = {
      margin: 20,
      color: '#413a42',
      fontSize: 10,
    },
    secondaryColor = '#808080',
  } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let imageHeight;
  let imageWidth;

  const logoHeightAndWidth = 70;

  localCursor.y += base.margin;

  if (agenda.image) {
    const logo = await addAgendaLogo(
      doc,
      agenda.image,
      localCursor,
      logoHeightAndWidth,
    );

    imageHeight = logo.height;
    imageWidth = logo.width;
    localCursor.x += logo.width + base.margin;
  }
  const textMaxWidth = doc.page.width - imageWidth - base.margin * 3;

  const { height: heightOfTitle, width: widthOfTitle } = addText(
    doc,
    localCursor,
    agenda.title,
    { width: textMaxWidth, fontSize: 14, base, bold: true },
  );

  localCursor.y += heightOfTitle + base.margin / 10;

  const { height: heightOfDescription, width: widthOfDescription } = addText(
    doc,
    localCursor,
    agenda.description,
    { width: textMaxWidth, fontSize: 12, base },
  );
  localCursor.y += heightOfDescription + base.margin / 10;

  const { height: heightOfURL, width: widthOfURL } = addText(
    doc,
    localCursor,
    agenda.url,
    {
      width: textMaxWidth,
      fontSize: 12,
      base,
      underline: false,
      link: agenda.url,
    },
  );

  localCursor.y += heightOfURL + base.margin / 10;

  const { height: heightOfAgendaURL, width: widthOfAgendaURL } = addText(
    doc,
    localCursor,
    `https://openagenda.com/${agenda.slug}`,
    {
      color: secondaryColor,
      width: textMaxWidth,
      fontSize: 12,
      base,
      underline: false,
      link: `https://openagenda.com/${agenda.slug}`,
    },
  );

  localCursor.y += heightOfAgendaURL;

  const textColHeight = localCursor.y;

  localCursor.y = Math.max(textColHeight, imageHeight) + base.margin;
  localCursor.x = base.margin * 3;

  const { height: separatorLineHeight } = addSeparatorLine(doc, localCursor, {
    base,
    width: doc.page.width - base.margin * 6,
  });

  localCursor.y += separatorLineHeight;

  return {
    width:
      imageWidth
      + Math.max(widthOfTitle, widthOfDescription, widthOfURL, widthOfAgendaURL),
    height: Math.max(imageHeight, localCursor.y - cursor.y),
    cursor: localCursor,
  };
}
