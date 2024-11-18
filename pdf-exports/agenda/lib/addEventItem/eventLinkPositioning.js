import addText from '../addText.js';

export default function eventLinkPositioning(doc, cursor, event, options = {}) {
  const { columnMaxWidth, secondaryColor, fontSize, base, simulate, agenda } = options;

  const { width, height } = addText(
    doc,
    cursor,
    `https://openagenda.com/${agenda.slug}/events/${event.slug}`,
    {
      color: secondaryColor,
      width: columnMaxWidth,
      fontSize,
      base,
      underline: false,
      link: `https://openagenda.com/${agenda.slug}/events/${event.slug}`,
      simulate,
    },
  );

  return {
    width,
    height,
  };
}
