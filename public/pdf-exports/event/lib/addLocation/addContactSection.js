import addText from '../addText.js';
import iconPositioning from '../iconPositioning.js';

export default async function addContactSection(doc, cursor, options = {}) {
  const { content, iconHeightAndWidth, margin, width, lang, simulate } = options;
  const currentCursor = { ...cursor };

  let accumulatedHeight = 0;
  let maxWidth = 0;

  const { email } = content;
  const { phone } = content;

  const emailIcon = await iconPositioning(doc, cursor, 'email', {
    iconHeightAndWidth,
    margin,
    simulate,
  });

  if (email) {
    const emailSection = await addText(doc, cursor, {
      content: email,
      width: width - iconHeightAndWidth - margin / 2,
      link: `mailto:${email}`,
      lang,
      simulate,
    });
    accumulatedHeight += Math.max(emailIcon.height, emailSection.height);
    maxWidth = Math.max(maxWidth, emailIcon + margin / 2 + emailSection.width);

    if (!simulate) {
      cursor.y += emailSection.height;
    }
  }

  cursor.x = currentCursor.x;

  const phoneIcon = await iconPositioning(doc, cursor, 'phone', {
    iconHeightAndWidth,
    margin,
    simulate,
  });

  if (phone) {
    const phoneSection = await addText(doc, cursor, {
      content: phone,
      width: width - iconHeightAndWidth - margin / 2,
      link: `tel:${phone}`,
      lang,
      simulate,
    });
    accumulatedHeight += Math.max(phoneIcon.height, phoneSection.height);
    maxWidth = Math.max(maxWidth, phoneIcon + margin / 2 + phoneSection.width);
  }

  cursor.x = currentCursor.x;
  cursor.y = currentCursor.y;

  return {
    height: accumulatedHeight,
    width: maxWidth,
  };
}
