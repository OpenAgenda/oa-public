'use strict';

const converEventLegacyFormat = require('../index');
const convertAccessibility = require('../lib/convertAccessibility');
const convertOriginAgenda = require('../lib/convertOriginAgenda');
const convertImage = require('../lib/convertImage');
const getLongDescriptionLinks = require('../lib/getLongDescriptionLinks');
const convertTimings = require('../lib/convertTimings');
const getLocationInfo = require('../lib/getLocationInfo');
const firstLastTimings = require('../lib/firstLastTimings');
const getTags = require('../lib/getTags');
const getCustom = require('../lib/getCustom');
const convertRegistration = require('../lib/convertRegistration');
const getCategory = require('../lib/getCategory');
const getPermalink = require('../lib/getPermalink');
const convertKeywords = require('../lib/convertKeywords');
const convertAge = require('../lib/convertAge');
const convertMember = require('../lib/convertMember');

const bordeauxFormSchema = require('./fixtures/bordeaux.formSchema.json');
const bordeauxTagSet = require('./fixtures/bordeaux.tagSet.json');
const bordeauxEventV1 = require('./fixtures/bordeaux.eventV1.json');
const bordeauxEventV2 = require('./fixtures/bordeaux.eventV2.json');

const lilleEventV1 = require('./fixtures/lille.eventV1.json');
const lilleEventV2 = require('./fixtures/lille.eventV2.json');
const lilleTagSet = require('./fixtures/lille.tagSet.json');
const lilleFormSchema = require('./fixtures/lille.formSchema.json');

const meudonEventV1 = require('./fixtures/meudon.eventV1.json');
const meudonEventV2 = require('./fixtures/meudon.eventV2.json');
const meudonTagSet = require('./fixtures/meudon.tagSet.json');
const meudonFormSchema = require('./fixtures/meudon.formSchema.json');

const bordeauxAgendaSettings = {
  legacy: bordeauxTagSet,
  formSchema: bordeauxFormSchema,
  uid: 83549053,
  slug: 'bordeaux-metropole',
  interfaces: {
    admin: false,
    renderHTMLFromMarkdown: () => '<p>Balade en nocturne à la lumière des lampions à travers le parc</p>\n'
  },
  root: 'https://openagenda.com'
};

const lilleAgendaSettings = {
  legacy: lilleTagSet,
  formSchema: lilleFormSchema
};

describe('Convert specific fields', () => {
  test('convert image', () => {
    expect(convertImage(bordeauxEventV2.image)).toStrictEqual({
      image: bordeauxEventV1.image,
      thumbnail: bordeauxEventV1.thumbnail,
      originalImage: bordeauxEventV1.originalImage
    });
  });

  test('convert accessibility', () => {
    expect(convertAccessibility({
      ii: false,
      hi: true,
      vi: true,
      pi: false,
      mi: true
    })).toStrictEqual([
      'hi',
      'vi',
      'mi'
    ]);
  });

  test('convert originAgenda', () => {
    expect(convertOriginAgenda(bordeauxEventV2)).toStrictEqual(bordeauxEventV1.origin);
  });

  test('convert timings', () => {
    expect(convertTimings(bordeauxEventV2.timings)).toStrictEqual(bordeauxEventV1.timings);
  });

  test('Get the links in the long description', () => {
    expect(getLongDescriptionLinks(bordeauxEventV2.links)).toStrictEqual(bordeauxEventV1.longDescriptionLinks);
  });

  test('Get location information', () => {
    expect(getLocationInfo(bordeauxEventV2.location)).toStrictEqual({
      locationName: bordeauxEventV1.locationName,
      locationUid: bordeauxEventV1.locationUid,
      address: bordeauxEventV1.address,
      postalCode: bordeauxEventV1.postalCode,
      city: bordeauxEventV1.city,
      district: bordeauxEventV1.district,
      department: bordeauxEventV1.department,
      region: bordeauxEventV1.region,
      latitude: bordeauxEventV1.latitude,
      longitude: bordeauxEventV1.longitude,
    });
  });

  test('Get the first and last date and time', () => {
    expect(firstLastTimings(bordeauxEventV2.timings, bordeauxEventV2.timezone)).toStrictEqual({
      firstDate: '2021-11-12',
      firstTimeStart: '18:00',
      firstTimeEnd: '22:00',
      lastDate: '2022-01-02',
      lastTimeStart: '18:00',
      lastTimeEnd: '22:00',
    });
  });

  test('Convert registration', () => {
    expect(convertRegistration(bordeauxEventV2.registration)).toStrictEqual({ registration: bordeauxEventV1.registration, registrationUrl: bordeauxEventV1.registrationUrl });
  });

  test('Convert keywords', () => {
    expect(convertKeywords(bordeauxEventV2.keywords)).toStrictEqual(bordeauxEventV1.keywords);
  });

  test('Convert age', () => {
    expect(convertAge(bordeauxEventV2.age)).toStrictEqual(bordeauxEventV1.age);
  });

  test('Convert member to contributor', () => {
    expect(convertMember(false, bordeauxEventV2.member)).toStrictEqual({ organization: 'Médiathèque' });
  });

  test('Return the event\'s permalink', () => {
    expect(getPermalink(bordeauxAgendaSettings, bordeauxEventV2)).toStrictEqual(`https://openagenda.com/agendas/${bordeauxAgendaSettings.uid}/events/${bordeauxEventV2.uid}`);
  });

  test('Return the custom fields', () => {
    expect(getCustom(bordeauxAgendaSettings, bordeauxEventV2)).toStrictEqual(bordeauxEventV1.custom);
  });

  test('Return the category fields', () => {
    expect(getCategory(bordeauxAgendaSettings, bordeauxEventV2)).toStrictEqual(bordeauxEventV1.category);
  });
});

describe('Return the event\'s tagGroup', () => {
  test('Event without tags', () => {
    expect(getTags(bordeauxAgendaSettings, {})).toStrictEqual(
      {
        tags: [],
        tagGroups: []
      }
    );
  });

  test('Event with tags', () => {
    expect(getTags(lilleAgendaSettings, lilleEventV2)).toStrictEqual(
      { tagGroups: lilleEventV1.tagGroups, tags: lilleEventV1.tags }
    );
  });
});

test('Convert event version 2 to version 1', () => {
  delete bordeauxEventV1.hasPrivateCustomFields;

  const convertedContent = converEventLegacyFormat(bordeauxAgendaSettings, bordeauxEventV2);
  expect(convertedContent).toMatchObject(bordeauxEventV1);
});

describe('An admin key allows access to restricted fields', () => {
  bordeauxAgendaSettings.admin = true;
  const convertedContent = converEventLegacyFormat(bordeauxAgendaSettings, bordeauxEventV2);

  test('State is included', () => {
    expect(convertedContent.state).toBe(bordeauxEventV1.state);
  });

  test('All member fields are included', () => {
    expect(convertedContent.contributor).toStrictEqual(bordeauxEventV1.contributor);
  });
});

test('Convert Meudon event from version 2 to version 1', () => {
  const meudonAgendaSettings = {
    legacy: meudonTagSet,
    formSchema: meudonFormSchema,
    uid: 11207540,
    slug: 'meudon',
    interfaces: {
      admin: false,
      renderHTMLFromMarkdown: () => '<p>Un jeune dealer Noir de Brooklyn se retrouve coincé entre son mentor, un frère peu recommandable, et un policier Blanc, bien décidé à le faire condamner pour le meurtre d\'un trafiquant du quartier.</p>\n'
    },
    root: 'https://openagenda.com'
  };

  const convertedContent = converEventLegacyFormat(meudonAgendaSettings, meudonEventV2);
  expect(convertedContent).toMatchObject(meudonEventV1);
});
