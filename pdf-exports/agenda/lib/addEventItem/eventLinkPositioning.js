import addText from '../addText.js';

export default function eventLinkPositioning(doc, cursor, event, options = {}) {
  const { columnMaxWidth, secondaryColor, fontSize, base, simulate, agenda } = options;

  // The event's canonical address when it carries one: the page its licensor
  // declared, else its page on its origin agenda.
  const url = event.canonicalUrl
    || `https://openagenda.com/${agenda.slug}/events/${event.slug}`;

  const { width, height } = addText(doc, cursor, url, {
    color: secondaryColor,
    width: columnMaxWidth,
    fontSize,
    base,
    underline: false,
    link: url,
    simulate,
  });

  return {
    width,
    height,
  };
}
