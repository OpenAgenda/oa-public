import addRegistration from '../addRegistration.js';

export default function registrationPositioning(
  doc,
  cursor,
  event,
  options = {},
) {
  const { fontSize, base, iconHeightAndWidth, margin, intl, simulate } = options;

  if (event.registration.length !== 0 && event.registration !== null) {
    const { width, height } = addRegistration(
      doc,
      event,
      cursor,
      {
        base,
        iconHeightAndWidth,
        fontSize,
        margin,
      },
      { simulate, intl },
    );

    return {
      width,
      height,
    };
  }
  return {
    width: 0,
    height: 0,
  };
}
