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
    before: eventBefore,
    patch = false,
    imageBasePath,
  } = options;

  const {
    venueId,
    addressId,
    category,
    bookingContact,
    description,
    bookingEmail,
    duo = false,
    name = null,
    eventDuration = null,
    itemCollectionDetails = null,
  } = passData;

  const formatted = {
    accessibility: acc(event),
    description: await formatText(
      description === 'linked desc' ? event.longDescription : description,
    ),
    itemCollectionDetails: await formatText(
      itemCollectionDetails || event.conditions,
      { limit: 500 },
    ),
    name: await formatText(name || flatten(event.title, lang), {
      limit: 90,
      markdownToString: false,
    }),
  };

  if (!patch) {
    formatted.hasTicket = false;
  }

  if (event.image) {
    const { base: currentBase, variants, path } = event.image;

    const base = currentBase ?? eventBefore?.image?.base ?? imageBasePath;

    formatted.image = {
      file: await processImage(
        path
          ? {
            path,
          }
          : {
            url: `${base}${variants.find((v) => v.type === 'full').filename}`,
          },
      ),
    };

    formatted.image.credit = event.imageCredits;
  }

  if (addressId && venueId) {
    formatted.location = {
      type: 'address',
      venueId,
      addressId,
      addressLabel: event.location.name,
    };
  }

  if (venueId && !addressId) {
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

  if (bookingEmail) {
    formatted.bookingEmail = bookingEmail;
  }

  if (duo) {
    formatted.enableDoubleBookings = duo;
  }

  if (eventDuration) {
    formatted.eventDuration = eventDuration;
  }

  return formatted;
}
