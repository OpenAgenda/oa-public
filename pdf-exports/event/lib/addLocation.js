import { getLocaleValue } from '@openagenda/intl';
import addText from './addText.js';
import imagePositioning from './imagePositioning.js';
import iconPositioning from './iconPositioning.js';

function isOverflowing(cursor, accumulatedHeight, height) {
  return cursor.y + accumulatedHeight > height;
}

async function addLocationSection(doc, cursor, width, content, options = {}) {
  const { lang, simulate } = options;
  let accumulatedHeight = 0;
  let maxWidth = 0;

  if (content.location.name || content.location.address) {
    const locationSectionTitle = await addText(doc, cursor, {
      content: 'Lieu',
      width,
      bold: true,
      lang,
      simulate,

    });
    accumulatedHeight += locationSectionTitle.height;
    maxWidth = Math.max(maxWidth, locationSectionTitle.width);

    if (!simulate) {
      cursor.y += locationSectionTitle.height;
    }

    if (content.location.name) {
      const locationSectionName = await addText(doc, cursor, {
        content: content.location.name,
        width,
        lang,
        simulate,
      })
      accumulatedHeight += locationSectionName.height;
      maxWidth = Math.max(maxWidth, locationSectionTitle.width);

      if (!simulate) {
        cursor.y += locationSectionName.height;
      }
    }
    if (content.location.address) {
      const locationSectionAddress = await addText(doc, cursor, {
        content: content.location.address,
        width,
        lang,
        simulate,
      })
      accumulatedHeight += locationSectionAddress.height;
      maxWidth = Math.max(maxWidth, locationSectionTitle.width);

      if (!simulate) {
        cursor.y += locationSectionAddress.height;
      }
    }
  }
  return {
    height: accumulatedHeight,
    width: maxWidth,
  };
}

async function addOnlineSection(doc, cursor, width, content, options = {}) {
  const { lang, simulate } = options;
  let accumulatedHeight = 0;
  let maxWidth = 0;

  if (content.onlineAccessLink) {
    const onlineSectionName = await addText(doc, cursor, {
      content: 'En ligne',
      width,
      bold: true,
      lang,
      simulate,
    })

    accumulatedHeight += onlineSectionName.height;
    maxWidth = Math.max(maxWidth, onlineSectionName.width);

    if (!simulate) {
      cursor.y += onlineSectionName.height;
    }

    if (content.onlineAccessLink) {
      const onlineSectionContent = await addText(doc, cursor, {
        content: content.onlineAccessLink,
        width,
        link: content.onlineAccessLink,
        lang,
        simulate,
      })
      accumulatedHeight += onlineSectionContent.height;
      maxWidth = Math.max(maxWidth, onlineSectionContent.width);

      if (!simulate) {
        cursor.y += onlineSectionContent.height;
      }
    }
  }
  return {
    height: accumulatedHeight,
    width: maxWidth,
  };
}

async function addAboutLocationSection(doc, cursor, width, content, options = {}) {
  const { lang, simulate } = options;
  let accumulatedHeight = 0;
  let maxWidth = 0;

  if (content.location.description) {
    const aboutLocationSectionName = await addText(doc, cursor, {
      content: 'À propos du lieu',
      width,
      bold: true,
      lang,
      simulate,
    })
    accumulatedHeight += aboutLocationSectionName.height;
    maxWidth = Math.max(maxWidth, aboutLocationSectionName.width);
    
    if (!simulate) {
      cursor.y += aboutLocationSectionName.height;
    }

    const aboutLocationSectionContent = await addText(doc, cursor, {
      content: getLocaleValue(content.location.description, lang),
      width,
      lang,
      simulate,
    })
    accumulatedHeight += aboutLocationSectionContent.height;
    maxWidth = Math.max(maxWidth, aboutLocationSectionContent.width);

    if (!simulate) {
      cursor.y += aboutLocationSectionContent.height;
    }
  }
  return {
    height: accumulatedHeight,
    width: maxWidth,
  };
}

async function addTagsSection(doc, cursor, width, content, options = {}) {
  const { lang, simulate } = options;
  let accumulatedHeight = 0;
  let maxWidth = 0;

  if (content.location.tags) {
    const tagsSectionName = await addText(doc, cursor, {
      content: 'Tags',
      width,
      bold: true,
      lang,
      simulate,
    })
    accumulatedHeight += tagsSectionName.height;
    maxWidth = Math.max(maxWidth, tagsSectionName.width);

    if (!simulate) {
      cursor.y += tagsSectionName.height;
    }

    for (const tag of content.location.tags) {
      const tagsSectionContent = await addText(doc, cursor, {
        content: tag.label,
        width,
        lang,
        simulate,
      })
      accumulatedHeight += tagsSectionContent.height;
      maxWidth = Math.max(maxWidth, tagsSectionContent.width);

      if (!simulate) {
        cursor.y += tagsSectionContent.height;
      }
    }
  }
  return {
    height: accumulatedHeight,
    width: maxWidth,
  };
}

async function addAccessSection(doc, cursor, width, content, options = {}) {
  const { lang, simulate } = options;
  let accumulatedHeight = 0;
  let maxWidth = 0;

  if (content.location.access) {
    const accessSectionName = await addText(doc, cursor, {
      content: 'Accès',
      width,
      bold: true,
      lang,
      simulate,
    })
    accumulatedHeight += accessSectionName.height;
    maxWidth = Math.max(maxWidth, accessSectionName.width);

    if (!simulate) {
      cursor.y += accessSectionName.height;
    }

    const accessSectionContent = await addText(doc, cursor, {
      content: getLocaleValue(content.location.access, lang),
      width,
      lang,
      simulate,
    })
    accumulatedHeight += accessSectionContent.height;
    maxWidth = Math.max(maxWidth, accessSectionContent.width);

    if (!simulate) {
      cursor.y += accessSectionContent.height;
    }
  }
  return {
    height: accumulatedHeight,
    width: maxWidth,
  };
}

async function addImageSection(doc, cursor, width, content, options = {}) {
  const { simulate } = options;
  let accumulatedHeight = 0;
  let maxWidth = 0;

  const imageSection = await imagePositioning(doc, cursor, {
    content: content.location.image,
    width,
    simulate,
  });

  accumulatedHeight += imageSection.height;
  maxWidth = Math.max(maxWidth, imageSection.width);

  if (!simulate) {
    cursor.y += imageSection.height;
  }

  return {
    height: accumulatedHeight,
    width: maxWidth,
  };
}

async function addContactSection(doc, cursor, width, content, options = {}) {
  const { iconHeightAndWidth, margin, lang, simulate } = options;
  const currentCursor = { ...cursor };
  let accumulatedHeight = 0;
  let maxWidth = 0;

  const emailIcon = await iconPositioning(doc, cursor, 'email', { iconHeightAndWidth, margin, simulate });

  if (content.location.email) {
    const emailSection = await addText(doc, cursor, {
      content: content.location.email,
      width: width - iconHeightAndWidth - margin / 2,
      link: `mailto:${content.location.email}`,
      lang,
      simulate,
    })
    accumulatedHeight += Math.max(emailIcon.height, emailSection.height);
    maxWidth = Math.max(maxWidth, emailIcon + margin / 2 + emailSection.width);

    if (!simulate) {
      cursor.y += emailSection.height;
    }
  }

  cursor.x = currentCursor.x;

  const phoneIcon = await iconPositioning(doc, cursor, 'phone', { iconHeightAndWidth, margin, simulate });

  if (content.location.phone) {
    const phoneSection = await addText(doc, cursor, {
      content: content.location.phone,
      width: width - iconHeightAndWidth - margin / 2,
      link: `tel:${content.location.phone}`,
      lang,
      simulate,
    })
    accumulatedHeight += Math.max(phoneIcon.height, phoneSection.height);
    maxWidth = Math.max(maxWidth, phoneIcon + margin / 2 + phoneSection.width);

    if (!simulate) {
      cursor.y += phoneSection.height;
    }
  }

  cursor.x = currentCursor.x;

  return {
    height: accumulatedHeight,
    width: maxWidth,
  };
}

async function addAdditionalLinksSection(doc, cursor, width, content, options = {}) {
  const { iconHeightAndWidth, margin, lang, simulate } = options;
  const currentCursor = { ...cursor };
  let accumulatedHeight = 0;
  let maxWidth = 0;

  if (content.location.links) {
    const additionalLinksSectionName = await addText(doc, cursor, {
      content: 'Liens additionnels',
      width,
      bold: true,
      lang,
      simulate,
    })
    accumulatedHeight += additionalLinksSectionName.height;
    maxWidth = Math.max(maxWidth, additionalLinksSectionName.width);

    if (!simulate) {
      cursor.y += additionalLinksSectionName.height;
    }

    for (const link of content.location.links) {
      const linkIcon = await iconPositioning(doc, cursor, 'link', { iconHeightAndWidth, margin, simulate });

      const additionalLinksSectionContent = await addText(doc, cursor, {
        content: link,
        width: width - iconHeightAndWidth - margin / 2,
        link,
        lang,
        simulate,
      })
      accumulatedHeight += Math.max(linkIcon.height, additionalLinksSectionContent.height);
      maxWidth = Math.max(maxWidth, linkIcon + margin / 2 + additionalLinksSectionContent.width);

      if (!simulate) {
        cursor.y += additionalLinksSectionContent.height;
      }
  
      cursor.x = currentCursor.x;
    }
  }
  return {
    height: accumulatedHeight,
    width: maxWidth,
  };  
}

const sections = [
  "location",
  "online",
  "aboutLocation",
  "tags",
  "access",
  "image",
  "contact",
  "additionalLinks",
];

export default async function addLocation(doc, cursor, options = {}) {
  const { content, width, height, iconHeightAndWidth, margin, lang, simulate } = options;

  let accumulatedHeight = 0;
  let maxWidth = 0;
  const currentCursor = { ...cursor };

  let remainingContent = sections.filter(section => !content.remainingContent || content.remainingContent.includes(section));
  
  for (let index = 0; index < remainingContent.length; index++) {
    const section = remainingContent[index];
    let addSection;

    switch(section) {
      case 'location': {
        addSection = (simulate) => addLocationSection(doc, cursor, width, content.event, { lang, simulate });
        break;
      }
      case 'online': {
        addSection = (simulate) => addOnlineSection(doc, cursor, width, content.event, { lang, simulate });
        break;
      }
      case 'aboutLocation': {
        addSection = (simulate) => addAboutLocationSection(doc, cursor, width, content.event, { lang, simulate });
        break;
      }
      case 'tags': {
        addSection = (simulate) => addTagsSection(doc, cursor, width, content.event, { lang, simulate });
        break;
      }
      case 'access': {
        addSection = (simulate) => addAccessSection(doc, cursor, width, content.event, { lang, simulate });
        break;
      }
      case 'image': {
        addSection = (simulate) => addImageSection(doc, cursor, width, content.event, { simulate });
        break;
      }
      case 'contact': {
        addSection = (simulate) => addContactSection(doc, cursor, width, content.event, { iconHeightAndWidth, margin, lang, simulate });
        break;
      }
      case 'additionalLinks': {
        addSection = (simulate) => addAdditionalLinksSection(doc, cursor, width, content.event, { iconHeightAndWidth, margin, lang, simulate });
        break;
      }
      default: {
        break;
      }
    }

    const addesSection = await addSection(true);

    accumulatedHeight += addesSection.height;
    maxWidth = Math.max(maxWidth, addesSection.width);

    if (isOverflowing(currentCursor, accumulatedHeight, height)) {
      cursor.y = currentCursor.y;
      return {
        remainingContent: remainingContent.slice(index),
        height: accumulatedHeight,
        width: maxWidth,
      }
    }
    
    await addSection(simulate);
  }

  cursor.y = currentCursor.y;
  
  return {
    width: maxWidth,
    height: accumulatedHeight,
    remainingContent: []
  };
}