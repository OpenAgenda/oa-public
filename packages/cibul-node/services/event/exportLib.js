import _ from 'lodash';
import async from 'async';
import moment from 'moment-timezone';
import { getTypesAndValues as registration } from '@openagenda/registration/src/validate.js';
import config from '../../config/index.js';
import pickEventImage from './lib/pickImage.js';
import getLongDescriptionHTML from './lib/getLongDescriptionHTML.js';
import instanciate from './instance/index.js';

const toUTC = (str) => new Date(str).toJSON();

const legacyLocationFieldsMap = {
  conditions: 'pricingInfo',
  registrationUrl: 'ticketLink',
  locationName: 'name',
  locationUid: 'uid',
  address: 'address',
  postalCode: 'postcode',
  city: 'city',
  district: 'district',
  department: 'department',
  region: 'region',
  latitude: 'latitude',
  longitude: 'longitude',
  timings: 'timings',
};

const locationFieldsMap = {
  uid: 'uid',
  name: 'name',
  slug: 'slug',
  address: 'address',
  image: 'image',
  imageCredits: 'imageCredits',
  postalCode: 'postcode',
  city: 'city',
  district: 'district',
  department: 'department',
  region: 'region',
  latitude: 'latitude',
  longitude: 'longitude',
  description: 'description',
  access: 'access',
  countryCode: 'countryCode',
  website: 'website',
  email: 'email',
  links: 'links',
  insee: 'insee',
  phone: 'phone',
  tags: 'tags',
  timezone: 'timezone',
  updatedAt: 'updatedAt',
  extId: 'extId',
};

function _inject(c, l, map) {
  for (const f in map) {
    if (Object.prototype.hasOwnProperty.call(map, f)) {
      c[f] = null;

      if (l[map[f]]) {
        c[f] = l[map[f]];
      }
    }
  }
}

function _extractKeywords(e) {
  if (!e.tags) return e.tags;

  const keywords = {};

  try {
    Object.keys(e.tags).forEach((l) => {
      keywords[l] = e.tags[l]
        ? e.tags[l]
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length)
        : [];
    });
  } catch {
    //
  }

  return keywords;
}

export function clean(services, eInst, options, cb) {
  const callback = arguments.length === 2 ? options : cb;
  const opts = arguments.length === 2 ? {} : options;

  const { genUrl } = services;

  const OEmbedLinks = eInst.getLinks();

  const c = {
    uid: eInst.uid,
    slug: eInst.slug,
    canonicalUrl: genUrl(
      'eventShow',
      { eventSlug: eInst.slug },
      { protocol: 'https://' },
    ),
    title: eInst.title,
    description: eInst.description,
    longDescription: eInst.freeText || {},
    keywords: _extractKeywords(eInst),
    html: getLongDescriptionHTML(
      { services },
      eInst.freeText || {},
      opts.includeEmbedded ? OEmbedLinks : null,
    ),
    longDescriptionLinks: OEmbedLinks,
    image: eInst.getImage(),
    thumbnail: pickEventImage(config, eInst, 'thumbnail'),
    originalImage: pickEventImage(config, eInst, 'full'),
    age: eInst.getAge(),
    accessibility: eInst.getAccessibility(),
    updatedAt: eInst.updatedAt,
    createdAt: eInst.createdAt,
    range: {
      fr: eInst.getRange('fr'),
      en: eInst.getRange('en'),
      de: eInst.getRange('de'),
      es: eInst.getRange('es'),
      it: eInst.getRange('it'),
    },
    location: null,
    attendanceMode: eInst.attendanceMode,
    onlineAccessLink: eInst.onlineAccessLink || null,
    status: eInst.status || 1,
  };

  const l = eInst.locations.length ? eInst.locations[0] : false;

  if (c.image) {
    c.imageCredits = eInst.imageCredits || null;
  }

  if (eInst.origin) {
    c.origin = eInst.origin;

    c.origin.oaUrl = genUrl(
      'agendaRedirect',
      { uid: c.origin.uid },
      { protocol: 'https://' },
    );
  }

  if (l && l.uid) {
    _inject(c, l, legacyLocationFieldsMap);

    c.location = {};

    _inject(c.location, l, locationFieldsMap);

    if (c.location.image && !c.location.image.includes('//')) {
      c.location.image = config.s3.mainBucketPath.replace('https:', '') + c.location.image;
    }
  }

  c.registration = registration(c.registrationUrl);
  c.registrationUrl = (
    (c.registration || []).filter((v) => v.type === 'link').pop() || {
      value: null,
    }
  ).value;

  const { timezone } = eInst.getLocationDetails();

  eInst.getTimings((err, timings) => {
    if (err) return callback(err);

    let tFirst;
    let tLast;

    _.extend(c, {
      firstDate: null,
      firstTimeStart: null,
      firstTimeEnd: null,
      lastDate: null,
      lastTimeStart: null,
      lastTimeEnd: null,
    });

    if (timings.length) {
      tFirst = {
        start: new Date(timings[0].start),
        end: new Date(timings[0].end),
      };

      tLast = {
        start: new Date(timings[timings.length - 1].start),
        end: new Date(timings[timings.length - 1].end),
      };

      _.extend(c, {
        timings: timings.map((t) => ({
          start: toUTC(t.start),
          end: toUTC(t.end),
        })),
        firstDate: moment.tz(tFirst.start, timezone).format('YYYY-MM-DD'),
        firstTimeStart: moment.tz(tFirst.start, timezone).format('HH:mm'),
        firstTimeEnd: moment.tz(tFirst.end, timezone).format('HH:mm'),
        lastDate: moment.tz(tLast.start, timezone).format('YYYY-MM-DD'),
        lastTimeStart: moment.tz(tLast.start, timezone).format('HH:mm'),
        lastTimeEnd: moment.tz(tLast.end, timezone).format('HH:mm'),
      });
    }

    callback(null, c);
  });
}

export function cleanEvents(services, events, options, cb) {
  const callback = arguments.length === 2 ? options : cb;
  const opts = arguments.length === 2 ? {} : options;

  async.map(
    events,
    (e, mcb) => {
      clean(services, instanciate(e), opts, mcb);
    },
    callback,
  );
}
