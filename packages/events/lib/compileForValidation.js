import { createReadStream, unlink } from 'node:fs';
import { Agent } from 'node:https';
import { PassThrough } from 'node:stream';
import _ from 'lodash';

import logs from '@openagenda/logs';
import replaceAccents from '@openagenda/utils/replaceAccents.js';

import dateHoursMinutesTiming from '../iso/validators/dateHoursMinutesTiming.js';
import { from as fromDHM } from '../iso/convertDateHoursMinutesTiming.js';
import cleanImageURL from './cleanImageURL.js';
import ValidationError from './ValidationError.js';
import fields from './fields.js';

const isDHM = dateHoursMinutesTiming.is;

const log = logs('compileForValidation');

const statusSlugs = fields
  .find((f) => f.field === 'status')
  .options.map((o) => o.value);
const fieldNames = fields
  .filter((f) => (f.write || []).includes('public'))
  .map((f) => f.field);

const fetchImageAsStream = async (url, maxContentLength) => {
  const agent = new Agent({
    rejectUnauthorized: false,
  });

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'OA',
      'Accept-Charset': '*',
      Accept: '*/*',
    },
    agent,
    timeout: 10000,
  });

  if (!response.ok) {
    throw new Error(`Invalid status (${response.status})`);
  }

  const reader = response.body.getReader();
  const passThrough = new PassThrough();
  let contentLength = 0;

  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          passThrough.end();
          break;
        }
        contentLength += value.length;
        if (contentLength > maxContentLength) {
          passThrough.destroy(
            new Error('Content length exceeded the maximum limit'),
          );
          reader.cancel();
          break;
        }
        passThrough.write(value);
      }
    } catch (error) {
      passThrough.destroy(error);
    }
  })().catch(() => null);

  return passThrough;
};

export default async function compileForValidation(
  current,
  data,
  options = {},
) {
  const {
    maxImageSize = 20971520,
    protectedMode = true,
    isPatch = false,
    mergeExtIds = true,
  } = options;

  const editedFields = Object.keys(_.omit(data, ['draft'])).filter((f) =>
    (protectedMode ? fieldNames.includes(f) : true));

  const compiled = {
    ...current || {},
    ...data,
  };

  if (
    (isPatch || mergeExtIds)
    && current?.extIds?.length > 0
    && data?.extIds?.length > 0
  ) {
    compiled.extIds = current.extIds.reduce((acc, extId) => {
      if (acc.find((a) => a.key === extId.key)) {
        return acc;
      }
      return acc.concat(extId);
    }, data.extIds);
  }

  const image = data?.image;

  if (image?.url) {
    log('image is provided as url %s', image?.url);

    const cleanURL = cleanImageURL(image.url);

    try {
      compiled.image = await fetchImageAsStream(cleanURL, maxImageSize);
    } catch (error) {
      log.warn({
        message: 'failed to parse image URL',
        error,
      });
      throw new ValidationError({
        field: 'image',
        code: 'url.invalid',
        message: 'provided image url is not valid',
      });
    }
  } else if (image?.path && !('transformAndUpload' in image)) {
    log('image is provided through local filesystem path: %s', image?.path);
    compiled.image = createReadStream(image?.path);
    compiled.image.on('close', () => unlink(image.path, () => {}));
  } else if (image?.filename === null) {
    log('image is unset through filename value %s', image?.filename);
    compiled.image = null;
  } else if (
    typeof data?.image?.filename === 'string'
    && !('transformAndUpload' in image)
  ) {
    compiled.image = current?.image || data?.image;
  }

  // edge case: if DHM timings are being validated, their timezone must be
  // known for correctly evaluating time between beginning and end on DST days
  if ((compiled?.timings || []).length && isDHM(compiled.timings[0])) {
    compiled.timings.forEach((t) => {
      t.timezone = compiled.timezone;
    });
  }

  if ((compiled?.timings ?? []).length) {
    compiled?.timings.forEach((t) => {
      const timing = isDHM(t)
        ? {
          begin: fromDHM(t.begin, compiled.timezone),
          end: fromDHM(t.end, compiled.timezone),
        }
        : t;
      if (timing.begin >= timing.end) {
        throw new ValidationError({
          field: 'timings',
          code: 'timings.invalid',
          message: 'timing end must be superior to begin',
        });
      }
    });
  }

  if (data?.location instanceof Object && !data?.locationUid) {
    compiled.locationUid = data.location.uid;
    editedFields.push('locationUid');
  }

  if (data?.location === null && !data?.locationUid) {
    compiled.locationUid = null;
    editedFields.push('locationUid');
  }

  if (
    data?.location instanceof Object
    && !data?.timezone
    && data.location.timezone
  ) {
    compiled.timezone = data.location.timezone;
    editedFields.push('timezone');
  }

  if (data.longDescription) {
    compiled.longDescription = replaceAccents(data.longDescription);
  }

  if (
    data.age
    && !Object.keys(data.age).filter((k) => data.age[k] !== undefined).length
  ) {
    compiled.age = { min: null, max: null };
    editedFields.push('age');
  }

  if (statusSlugs.includes(data?.status)) {
    compiled.status = fields
      .find((f) => f.field === 'status')
      .options.find((o) => o.value === data.status).id;
  }

  if (
    current?.registration?.find((r) => r.service === 'passCulture')
    && data.registration
    && !data.registration.find((r) => r.service === 'passCulture')?.data
  ) {
    const passReg = current?.registration?.find(
      (r) => r.service === 'passCulture',
    );

    const dataRegistrationValues = Array.isArray(data.registration)
      ? data.registration.map((r) =>
        (typeof r === 'object' && r !== null ? r.value : r))
      : [];

    if (dataRegistrationValues.includes(passReg.value)) {
      compiled.registration = []
        .concat(passReg)
        .concat(
          data.registration.filter(
            (r) =>
              (typeof r === 'object' && r !== null ? r.value : r)
              !== passReg.value,
          ),
        );
    }
  }

  return {
    compiled,
    editedFields,
  };
}
