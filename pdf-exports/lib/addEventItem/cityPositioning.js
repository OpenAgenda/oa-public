import addText from '../addText.js';
import cleanString from '../cleanString.js';

export default function cityPositioning(doc, cursor, event, options = {}) {
  const { columnMaxWidth, fontSize, base, simulate } = options;

  let cityHeight = 0;

  if (event.location?.city) {
    const { width: cityWidth, height } = addText(doc, cursor, cleanString(event.location.city), {
      width: columnMaxWidth,
      fontSize,
      base,
      underline: false,
      simulate,
    });
    cursor.x += cityWidth;
    cityHeight = height;
  }

  return {
    width: cursor.x,
    height: cityHeight,
  };
}
