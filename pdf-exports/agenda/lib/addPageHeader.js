import addAgendaLogo from '../../utils/addAgendaLogo.js';
import addSeparatorLine from '../../utils/addSeparatorLine.js';
import addText from './addText.js';

export default async function addPagetHeader(
  agenda,
  doc,
  cursor,
  options = {},
) {
  const {
    base = {
      margin: 20,
      color: '#413a42',
    },
    little,
    medium,
  } = options;

  const localCursor = {
    y: cursor.y,
    x: cursor.x,
  };

  let heightOfSimulateTitle = null;
  let widthOfSimulateTitle = null;
  let heightOfTitle = null;
  let widthOfTitle = null;
  let logoHeight = 0;
  let logoWidth = null;
  let fontSize;
  let logoHeightAndWidth;
  let margin;

  if (little) {
    fontSize = 8;
    logoHeightAndWidth = 15;
    margin = base.margin / 6;
  } else if (medium) {
    fontSize = 9;
    logoHeightAndWidth = 20;
    margin = base.margin / 4;
  } else {
    fontSize = 10;
    logoHeightAndWidth = 25;
    margin = base.margin / 2;
  }
  localCursor.y = 0;
  localCursor.y += base.margin / 6;

  const titleMaxWidth = doc.page.width - base.margin * 6 - logoHeightAndWidth - margin;

  const simulateTitle = addText(doc, localCursor, agenda.title, {
    width: titleMaxWidth,
    fontSize,
    base,
    simulate: true,
  });
  heightOfSimulateTitle = simulateTitle.height;
  widthOfSimulateTitle = simulateTitle.width;

  if (agenda.image) {
    if (titleMaxWidth < widthOfSimulateTitle) {
      widthOfSimulateTitle = titleMaxWidth;
    }

    const headerIconText = logoHeightAndWidth + margin + widthOfSimulateTitle;

    localCursor.x = (doc.page.width - headerIconText) / 2;

    const logo = await addAgendaLogo(
      doc,
      agenda.image,
      localCursor,
      logoHeightAndWidth,
    );

    logoHeight = logo.height;
    logoWidth = logo.width;

    if (heightOfSimulateTitle < logoHeight) {
      localCursor.y += (logoHeight - heightOfSimulateTitle) / 2;
    } else {
      localCursor.y = 0;
    }
  }

  localCursor.x += logoWidth + margin;

  const title = addText(doc, localCursor, agenda.title, {
    width: titleMaxWidth,
    fontSize,
    base,
  });

  heightOfTitle = title.height;
  widthOfTitle = title.width;

  const totalWidth = logoWidth + widthOfTitle + base.margin * 3;

  localCursor.y = Math.max(heightOfTitle, logoHeight + base.margin / 6) + base.margin / 6;
  localCursor.x = base.margin * 3;

  const { height: separatorLineHeight } = addSeparatorLine(doc, localCursor, {
    base,
    width: doc.page.width - base.margin * 6,
  });

  localCursor.y += cursor.y + separatorLineHeight;

  return {
    width: totalWidth,
    height: Math.max(logoHeight, localCursor.y - cursor.y),
    cursor: localCursor,
  };
}
