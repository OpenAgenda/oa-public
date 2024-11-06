import convertDateHoursMinutesTimings from '../utils/convertDateHoursMinutesTimings.js';
import registrationValidator from '../iso/validators/registration.js';
import filterItemValuesByFieldAccess from './filterItemValuesByFieldAccess.js';
import toHTML from './toHTML.js';
import flatten from './flatten.js';

const { toListOfObjects: registationAsListOfObjects } = registrationValidator;

const getPathAndFilename = (file) => {
  if (!file) {
    return { filename: null, path: null };
  }
  const parts = file.split('/');
  const filename = parts.pop();
  return {
    filename,
    path: `${parts.join('/')}/`,
  };
};

export default (event, options = {}) => {
  const {
    locations,
    agendas,
    imagePath,
    access,
    html,
    lang,
    includeFields,
    defaultImage,
    useDefaultImage,
    imageAsLink,
    useDateHoursMinutesFormat,
    useLocationObjectFormat,
  } = options;

  const additionalFields = [];
  const excludeFields = [];

  if (html) {
    event.html = toHTML(event.longDescription);
    additionalFields.push('html');
  }

  if (locations) {
    event.location = []
      .concat(locations)
      .filter((l) => l.uid === event.locationUid)
      .pop();
    additionalFields.push('location');
  }

  if (agendas) {
    event.agenda = []
      .concat(agendas)
      .filter((a) => a.uid === event.agendaUid)
      .pop();
    additionalFields.push('agenda');
  }

  const { path: defaultImagePath, filename: defaultImageFilename } = getPathAndFilename(defaultImage);

  if (event.image) {
    delete event.image.credits;
  }

  if (event.image && Object.keys(event.image).length) {
    event.image.base = imagePath;
  } else if (event.image) {
    event.image = null;
  }

  if (useDefaultImage && !event?.image?.filename) {
    event.image = {
      filename: defaultImageFilename,
      base: defaultImagePath,
    };
  }

  if (imageAsLink && event.image) {
    event.image = `${event.image.base}${event.image.filename}`;
  }

  if (useDateHoursMinutesFormat && event.timings) {
    convertDateHoursMinutesTimings.to(event.timings, event.timezone);
  }

  if (useLocationObjectFormat && event.locationUid && !event.location) {
    event.location = { uid: event.locationUid };
    excludeFields.push('locationUid');
    additionalFields.push('location');
  }

  if (
    event.age
    && !Object.keys(event.age).filter((k) => event.age[k] !== undefined).length
  ) {
    event.age = { min: null, max: null };
  }

  if (event.registration) {
    event.registration = registationAsListOfObjects(event.registration);
  }

  return filterItemValuesByFieldAccess(
    lang ? flatten(event, lang, options) : event,
    {
      access,
      includeFields,
      additionalFields,
      excludeFields,
    },
  );
};
