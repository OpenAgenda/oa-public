import { BadRequest } from '@openagenda/verror';
import extractStreetFromOAAddress from '../../lib/extractStreetFromOAAddress.js';
import validateRelatedField from './validateRelatedField.js';
import validateEmail from './validateEmail.js';

export default function validateEventOffer(data, event, options = {}) {
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

  // Validate event location if it exists
  if (event?.location) {
    // Validate postal code

    if (!event.location.postalCode) {
      errors.push({
        message: 'event location postal code is required',
        code: 'registration.pass.invalidLocationPostalCode',
        label: "Le code postal de l'événement est requis",
        field: 'location.postalCode',
      });
    }

    // Validate address exists
    if (!event.location.address) {
      errors.push({
        message: 'event location address is required',
        code: 'registration.pass.invalidLocationAddress',
        label: "L'adresse de l'événement est requise",
        field: 'location.address',
      });
    }

    // Validate that street can be extracted from address
    if (event.location.address && event.location.postalCode) {
      const extractedStreet = extractStreetFromOAAddress(event.location);
      if (!extractedStreet || extractedStreet.trim() === '') {
        errors.push({
          message: 'event location street cannot be extracted from address',
          code: 'registration.pass.invalidLocationStreet',
          label: "La rue ne peut pas être extraite de l'adresse de l'événement",
          field: 'location.address',
        });
      }
    }
  }

  if (errors.length) {
    throw new BadRequest(
      {
        info: { errors },
      },
      'Validation failed',
    );
  }

  return clean;
}
