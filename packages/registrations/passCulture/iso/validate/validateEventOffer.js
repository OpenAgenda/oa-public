import { BadRequest } from '@openagenda/verror';
import validateRelatedField from './validateRelatedField.js';
import validateEmail from './validateEmail.js';

export default function validateEventOffer(data, options = {}) {
  const { categories, related, partial = false } = options;

  const { bookingContact, venueId, bookingEmail, itemCollectionDetails } = data;

  const clean = [
    'name',
    'description',
    'duo',
    'eventDuration',
    'updateEventOffer',
  ].reduce(
    (usedData, field) =>
      (data[field] ? { ...usedData, [field]: data[field] } : usedData),
    {},
  );

  const errors = [];

  if (!data.category && !partial) {
    errors.push({
      message: 'category is required',
      code: 'registration.pass.requiredCategory',
      label: 'Une catégorie doit être définie',
      field: 'category',
    });
  }

  const matchingSettingsCategory = (categories ?? []).find(
    ({ value }) => data.category === value,
  );

  if (data.category && !matchingSettingsCategory && !partial) {
    errors.push({
      message: 'unknown category',
      code: 'registration.pass.unknownCategory',
      label: 'La catégorie spécifiée est inconnue',
      field: 'category',
    });
  }

  if (data.category && matchingSettingsCategory) {
    clean.category = data.category;
  }

  try {
    const { name: relatedFieldName, value: relatedFieldValue } = validateRelatedField({ categories, related }, data);

    if (relatedFieldName) {
      clean[relatedFieldName] = relatedFieldValue;
    }
  } catch (error) {
    error.info.errors.forEach((e) => errors.push(e));
  }

  if (venueId || !partial) {
    clean.venueId = parseInt(venueId, 10);
  }

  if ((!partial || clean.venueId) && Number.isNaN(clean.venueId)) {
    errors.push({
      message: 'venueId is required and must be an integer',
      code: 'registration.pass.invalidVenueId',
      label: 'Un lieu valide doit être défini',
      field: 'venueId',
    });
  }

  if ((partial && bookingContact) || !partial) {
    try {
      clean.bookingContact = validateEmail(bookingContact, 'bookingContact', {
        optional: false,
      });
    } catch (error) {
      error.info.errors.forEach((e) => errors.push(e));
    }
  }

  if ((partial && bookingEmail) || !partial) {
    try {
      clean.bookingEmail = validateEmail(bookingEmail, 'bookingEmail', {
        optional: true,
      });
    } catch (error) {
      error.info.errors.forEach((e) => errors.push(e));
    }
  }

  if ((partial && itemCollectionDetails) || !partial) {
    clean.itemCollectionDetails = itemCollectionDetails;
  }

  if (errors.length) {
    throw new BadRequest({
      info: { errors },
    });
  }

  return clean;
}
