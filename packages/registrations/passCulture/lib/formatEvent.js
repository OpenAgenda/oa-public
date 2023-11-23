import {
  flatten,
  formatText,
  processImage,
  getRelatedFieldName,
} from './utils.js';

const acc = ({ accessibility: a }) => ({
  audioDisabilityCompliant: a?.hi ?? false,
  mentalDisabilityCompliant: (a?.pi || a?.ii) ?? false,
  motorDisabilityCompliant: a?.mi ?? false,
  visualDisabilityCompliant: a?.vi ?? false,
});

export default async function formatEvent(event, ...args) {
  const options = args.pop();
  const passData = args[0] ?? {};

  const {
    lang = 'fr',
    categories = [],
  } = options;

  const {
    venueId,
    category,
    bookingContact,
    customDesc,
  } = passData;

  const formatted = {
    name: flatten(event.title, lang),
    accessibility: acc(event),
    description: await formatText(customDesc || event.longDescription),
    hasTicket: false,
  };

  if (event.image) {
    const {
      base,
      variants,
      path,
    } = event.image;

    formatted.image = {
      file: await processImage(path ? {
        path,
      } : {
        url: `${base}${variants.find(v => v.type === 'full').filename}`,
      }),
    };

    formatted.image.credit = event.imageCredits;
  }

  if (venueId) {
    formatted.location = {
      type: 'physical',
      venueId,
    };
  }

  if (!category) {
    return formatted;
  }

  if (category) {
    const relatedFieldName = getRelatedFieldName(categories, category);

    formatted.categoryRelatedFields = {
      category,
    };

    if (relatedFieldName) {
      formatted.categoryRelatedFields[relatedFieldName] = passData[relatedFieldName];
    }
  }

  if (bookingContact) {
    formatted.bookingContact = bookingContact;
  }

  return formatted;
}
