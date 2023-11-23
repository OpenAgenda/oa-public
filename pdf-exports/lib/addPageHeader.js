import addText from './addText.js';
import addAgendaLogo from './addAgendaLogo.js';
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
  } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let heightOfSimulateTitle = null;
  let widthOfSimulateTitle = null;
  let imageHeight = 0;
  let imageWidth = null;
  let heightOfTitle = null;
  let widthOfTitle = null;

  const logoHeightAndWidth = 25;

  localCursor.y += base.margin / 6;

  const titleMaxWidth = doc.page.width - base.margin * 9;

  const simulateTitle = addText(doc, localCursor, agenda.title, {
    width: titleMaxWidth,
    fontSize: 10,
    base,
    simulate: true,
  });
  heightOfSimulateTitle = simulateTitle.height;
  widthOfSimulateTitle = simulateTitle.width;

  if (agenda.image) {
    if (titleMaxWidth < widthOfSimulateTitle) {
      widthOfSimulateTitle = titleMaxWidth;
    }

    localCursor.x = (doc.page.width
        - (imageWidth
          + base.margin * 2
          + base.margin / 2
          + widthOfSimulateTitle))
      / 2;

    const logo = await addAgendaLogo(
      doc,
      agenda.image,
      localCursor,
      logoHeightAndWidth,
    );

    imageHeight = logo.height;
    imageWidth = logo.width;

    if (heightOfSimulateTitle > 15) {
      localCursor.y
        += (imageHeight - heightOfSimulateTitle) / 2 + base.margin / 6;
    } else {
      localCursor.y += logo.height / 3;
    }
  }

  localCursor.x += imageWidth + base.margin / 2;

  const title = addText(doc, localCursor, agenda.title, {
    width: titleMaxWidth,
    fontSize: 10,
    base,
  });

  heightOfTitle = title.height;
  widthOfTitle = title.width;

  const totalWidth = imageWidth + widthOfTitle + base.margin * 3;

  localCursor.y = cursor.y + Math.max(heightOfTitle, imageHeight) + (base.margin / 6) * 2;
  localCursor.x = base.margin * 3;

  const { height: separatorLineHeight } = addSeparatorLine(doc, localCursor, {
    base,
    width: doc.page.width - base.margin * 6,
  });

  localCursor.y += cursor.y + separatorLineHeight;

  return {
    width: totalWidth,
    height: Math.max(imageHeight, localCursor.y - cursor.y),
    cursor: localCursor,
  };
}
