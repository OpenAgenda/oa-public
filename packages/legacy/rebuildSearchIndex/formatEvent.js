'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');

const getLatestUpdated = (event, articles) => [event.updatedAt]
  .concat(articles.map(a => a.updatedAt))
  .reduce((latestUpdatedAt, updatedAt) => {
    if (!latestUpdatedAt) {
      return updatedAt;
    }
    return latestUpdatedAt < updatedAt ? updatedAt : latestUpdatedAt;
  });

function _age(e = {}) {
  if (!e.ageMin && !e.ageMax) return null;

  return {
    min: e.ageMin,
    max: e.ageMax
  };
}

function _JSONParse(v, valueOrigin = 'json value') {
  try {
    return JSON.parse(v);
  } catch (e) {
    throw new Error(`invalid ${valueOrigin}`);
  }
}

function _accessibility(e = {}) {
  return (e.accessibility || '').length ? _JSONParse(e.accessibility, 'accessibility') : [];
}

function _extractFromStore(store, fields, storeOrigin) {
  try {
    if (!store || !store.length) return {};

    const parsed = JSON.parse(store);

    return fields.map(f => (_.isArray(f) ? f : [f, f]))
      .reduce(
        (extract, [from, to]) => _.set(extract, to, _.get(parsed, from)),
        {}
      );
  } catch (e) {
    if (storeOrigin) throw new Error(`invalid ${storeOrigin} store`);
    throw new VError(e, 'failed extracting values from "%s"', store);
  }
}

function _timings(e) {
  try {
    return JSON.parse(e.timings);
  } catch (err) {
    throw new Error('invalid timings');
  }
}

function _isEmpty(obj) {
  return !_.keys(obj).filter(k => !!obj[k]).length;
}

function _pickNonEmpty(obj, fields) {
  return fields.reduce((picked, field) => (
    _isEmpty(obj[field]) ? picked : _.set(picked, field, obj[field])
  ), {});
}

function _emptyKeywords(keywords) {
  if (!_.isObject(keywords)) return true;

  return !_.keys(keywords).filter(lang => keywords[lang].length).length;
}

function _stringifyKeywords(keywords) {
  return _.mapValues(keywords, v => v.join(', '));
}

async function _fetch(knex, identifier) {
  const legacyEvent = await knex('event').first([
    'id',
    'owner_id as ownerId',
    'slug',
    'uid',
    'store',
    'created_at as createdAt',
    'updated_at as updatedAt',
    'is_published as isPublished',
    'file_key as fileKey',
    'age_min as ageMin',
    'age_max as ageMax',
    'accessibility',
    'image',
    'image_credits as credits',
    'custom_fields as customFields',
  ]).where(identifier).then(e => (e ? ({
    ...e,
    thumbnail: e.image ? `evtb${e.image}` : null,
    customFields: (e.customFields || '').length ? JSON.parse(e.customFields) : {}
  }) : null));

  if (!legacyEvent) throw new Error('no legacy event record');

  const event = await knex('event_2').first([
    'title',
    'description',
    'long_description as freeText',
    'keywords as tags',
    'location_uid as locationUid',
    'registration',
    'attendance_mode as attendanceMode',
    'online_access_link as onlineAccessLink',
    'conditions',
    'timings',
    'timezone',
    'references',
    'status',
    'agenda_uid as agendaUid',
    'updated_at as updatedAt'
  ]).where('uid', legacyEvent.uid)
    .then(e => {
      if (!e) return null;

      ['title', 'description', 'freeText', 'tags', 'conditions', 'registration'].forEach(f => {
        e[f] = _JSONParse(e[f], f);
      });

      e.references = e.references ? _JSONParse(e.references) : [];

      return _.set(e, 'timings', _timings(e));
    });

  if (!event) throw new Error('no event record');

  const location = await knex('location').first([
    'id',
    'uid',
    'slug',
    'placename as name',
    'address',
    'city',
    'department',
    'region',
    'city_district as district',
    'postal_code as postalCode',
    'country',
    'latitude',
    'longitude',
    'updated_at as updatedAt',
    'agenda_id as agendaId',
    'store',
    'eve_id as eveId',
    'insee'
  ]).where('uid', event.locationUid).then(l => (l ? {
    ...l,
    ..._extractFromStore(l.store, [
      'state',
      'image',
      'description',
      'tags',
      'email',
      'phone',
      'website',
      'links',
      'access',
      'state',
      'timezone',
      'imageCredits',
      'extId'
    ], 'location')
  } : null))
    .then(l => {
      if (!l) return null;

      ['description', 'access'].forEach(locationField => {
        if (l[locationField] instanceof Array) {
          l[locationField] = {};
        }
      });

      return l;
    });

  const articles = _.uniqBy(await knex('review_article as ra').select([
    'ra.id as id',
    'ra.user_id as userId',
    'ra.review_id as reviewId',
    'state',
    'ra.category_id as categoryId',
    'ra.store as store',
    'featured',
    'rr.organization as reviewer.organization',
    'ra.updated_at as updatedAt',
    'rr.store as reviewer.store'
  ]).leftJoin('reviewer as rr', function reviewerJoin() {
    this
      .on('ra.user_id', '=', 'rr.user_id')
      .andOn('ra.review_id', '=', 'rr.review_id');
  }).where('event_id', legacyEvent.id)
    .then(rows => rows.map(a => ({
      ..._.omit(a, ['store']),
      store: _JSONParse(a.store, 'article store'),
      reviewer: {
        ..._extractFromStore(a['reviewer.store'], [
          ['custom_fields.organization', 'organization'],
          ['custom_fields.contact_number', 'contactNumber'],
          ['custom_fields.email', 'email'],
          ['custom_fields.contact_name', 'contactName'],
          ['custom_fields.contact_position', 'contactPosition']
        ], 'reviewer'),
        organizationSlug: a['reviewer.organization']
      }
    }))), 'id');

  if (!articles.length) throw new Error('no review_article record');

  const categories = [];

  if (articles.filter(a => a.categoryId).length) {
    await knex('review_category').select([
      'id',
      'slug',
      'category as label'
    ]).whereIn(
      'id',
      articles.map(a => a.categoryId).filter(id => !!id)
    ).then(rows => rows.forEach(r => categories.push(
      _.pick(r, ['id', 'slug', 'label'])
    )));
  }

  const reviews = await knex('review').select([
    'id',
    'uid',
    'url',
    'slug',
    'title',
    'description',
    'image'
  ]).whereIn('id', articles.map(a => a.reviewId)).then(
    rows => rows.map(r => ({
      ...r,
      thumbnail: r.image ? `rwtb${r.image}` : false
    }))
  );

  const tags = await knex('review_tag as rt').select([
    'rt.id as id',
    'rt.slug as slug',
    'tag as label',
    'review_article_id as reviewArticleId'
  ]).leftJoin(
    'review_tag_article as rta',
    'rt.id',
    'rta.review_tag_id'
  ).whereIn('rta.review_article_id', articles.map(a => a.id));

  return {
    legacyEvent,
    event,
    location,
    articles,
    reviews,
    tags,
    categories
  };
}

module.exports = async ({ knex, imageBasePath }, id) => {
  const {
    legacyEvent,
    event,
    location,
    articles,
    reviews,
    categories,
    tags
  } = await _fetch(knex, _.isObject(id) ? _.pick(id, ['id', 'uid']) : { id });

  const origin = _.find(reviews, { uid: event.agendaUid });

  const timings = event.timings.map(t => ({
    start: t.begin,
    end: t.end
  }));

  const e = {
    ..._.pick(legacyEvent, [
      'id',
      'ownerId',
      'slug',
      'createdAt',
      'uid',
      'store'
    ]),
    ..._pickNonEmpty(event, [
      'title',
      'description',
      'freeText'
    ]),
    ..._emptyKeywords(event.tags) ? {} : { tags: _stringifyKeywords(event.tags) },
    ..._.pick(legacyEvent, [
      'isPublished',
      'fileKey'
    ]),
    status: event.status || 1,
    updatedAt: getLatestUpdated(event, articles),
    age: _age(legacyEvent),
    accessibility: _accessibility(legacyEvent),
    attendanceMode: event.attendanceMode || 1,
    onlineAccessLink: event.onlineAccessLink || null,
    locations: !location ? [{
      timings
    }] : [{
      ..._.pick(location, [
        'id',
        'uid',
        'slug'
      ]),
      verified: location.state === 1 ? 1 : 0,
      ..._.pick(location, [
        'name',
        'address',
        'city',
        'department',
        'region',
        'district',
      ]),
      postcode: location.postalCode,
      ..._.pick(location, [
        'country',
        'latitude',
        'longitude',
        'updatedAt'
      ]),
      timings,
      ..._.pick(location, [
        'agendaId',
        'store',
      ]),
      ...event.registration.length ? { ticketLink: event.registration.join(', ') } : {},
      ..._isEmpty(event.conditions) ? {} : { pricingInfo: event.conditions },
      ..._.pick(location, [
        'eveId',
        'postalCode',
        'insee'
      ]),
      countryCode: location.country,
      ...location.image ? { image: imageBasePath + location.image } : {},
      ..._.pick(location, [
        'description',
        'tags',
        'website',
        'email',
        'phone',
        'links',
        'access',
        'state',
        'timezone',
        'imageCredits',
        'extId'
      ])
    }],
    articles: articles.map(a => ({
      ..._.pick(a, [
        'userId',
        'state',
        'featured',
        'store'
      ]),
      review: _.pick(_.find(reviews, { id: a.reviewId }), [
        'id',
        'uid',
        'slug',
        'title',
        'description',
        'thumbnail'
      ]),
      references: event.references,
      tags: _.uniqBy(tags.filter(t => t.reviewArticleId === a.id).map(t => _.pick(t, [
        'id',
        'slug',
        'label'
      ])), 'id'),
      ...a.categoryId ? {
        category: _.find(categories, { id: a.categoryId })
      } : {},
      ..._isEmpty(a.reviewer) ? {} : { reviewer: a.reviewer }
    })),
    origin: _.pick(origin, [
      'uid',
      'title',
      'url',
      'slug'
    ]),
    reviewId: _.get(articles, '0.reviewId'),
    ...legacyEvent.image ? _.pick(legacyEvent, [
      'image',
      'thumbnail',
      'credits'
    ]) : {},
    ..._.pick(legacyEvent, ['customFields'])
  };

  return e;
};
