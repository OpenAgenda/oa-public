import converEventLegacyFormat from '../index.js';
import convertAccessibility from '../lib/convertAccessibility.js';
import convertOriginAgenda from '../lib/convertOriginAgenda.js';
import convertImage from '../lib/convertImage.js';
import getLongDescriptionLinks from '../lib/getLongDescriptionLinks.js';
import convertTimings from '../lib/convertTimings.js';
import getLocationInfo from '../lib/getLocationInfo.js';
import firstLastTimings from '../lib/getFirstLastTimings.js';
import getTags from '../lib/getTags.js';
import getCustom from '../lib/getCustom.js';
import convertRegistration from '../lib/convertRegistration.js';
import getCategory from '../lib/getCategory.js';
import getPermalink from '../lib/getPermalink.js';
import convertKeywords from '../lib/convertKeywords.js';
import convertAge from '../lib/convertAge.js';
import convertMember from '../lib/convertMember.js';
import flattenTagSet from '../../utils/flattenTagSet.js';
import bordeauxFormSchema from './fixtures/bordeaux.formSchema.json' with { type: 'json' };
import bordeauxTagSet from './fixtures/bordeaux.tagSet.json' with { type: 'json' };
import bordeauxEventV1 from './fixtures/bordeaux.eventV1.json' with { type: 'json' };
import bordeauxEventV2 from './fixtures/bordeaux.eventV2.json' with { type: 'json' };
import lilleEventV1 from './fixtures/lille.eventV1.json' with { type: 'json' };
import lilleEventV2 from './fixtures/lille.eventV2.json' with { type: 'json' };
import lilleTagSet from './fixtures/lille.tagSet.json' with { type: 'json' };
import lilleFormSchema from './fixtures/lille.formSchema.json' with { type: 'json' };
import meudonEventV1 from './fixtures/meudon.eventV1.json' with { type: 'json' };
import meudonEventV2 from './fixtures/meudon.eventV2.json' with { type: 'json' };
import meudonTagSet from './fixtures/meudon.tagSet.json' with { type: 'json' };
import meudonFormSchema from './fixtures/meudon.formSchema.json' with { type: 'json' };
import JNAFlattenTagSet from './fixtures/JNA.flattenTagSet.json' with { type: 'json' };

const bordeauxAgendaSettings = {
  legacy: bordeauxTagSet,
  formSchema: bordeauxFormSchema,
  uid: 83549053,
  slug: 'bordeaux-metropole',
  interfaces: {
    admin: false,
    renderHTMLFromMarkdown: () =>
      '<p>Balade en nocturne à la lumière des lampions à travers le parc</p>\n',
  },
  root: 'https://openagenda.com',
};

const lilleAgendaSettings = {
  legacy: lilleTagSet,
  formSchema: lilleFormSchema,
};

describe('Convert specific fields', () => {
  test('convert image', () => {
    expect(convertImage(bordeauxEventV2.image)).toEqual({
      image: bordeauxEventV1.image,
      thumbnail: bordeauxEventV1.thumbnail,
      originalImage: bordeauxEventV1.originalImage,
    });
  });

  test('convert accessibility', () => {
    expect(
      convertAccessibility({
        ii: false,
        hi: true,
        vi: true,
        pi: false,
        mi: true,
      }),
    ).toEqual(['hi', 'vi', 'mi']);
  });

  test('convert originAgenda', () => {
    expect(convertOriginAgenda(bordeauxEventV2)).toEqual(
      bordeauxEventV1.origin,
    );
  });

  test('convert timings', () => {
    expect(convertTimings(bordeauxEventV2.timings)).toEqual(
      bordeauxEventV1.timings,
    );
  });

  test('Get the links in the long description', () => {
    expect(getLongDescriptionLinks(bordeauxEventV2.links)).toEqual(
      bordeauxEventV1.longDescriptionLinks,
    );
  });

  test('Get location information', () => {
    expect(getLocationInfo(bordeauxEventV2.location)).toEqual({
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
    expect(
      firstLastTimings(bordeauxEventV2.timings, bordeauxEventV2.timezone),
    ).toEqual({
      firstDate: '2021-11-12',
      firstTimeStart: '18:00',
      firstTimeEnd: '22:00',
      lastDate: '2022-01-02',
      lastTimeStart: '18:00',
      lastTimeEnd: '22:00',
    });
  });

  test('Convert registration', () => {
    expect(convertRegistration(bordeauxEventV2.registration)).toEqual({
      registration: bordeauxEventV1.registration,
      registrationUrl: bordeauxEventV1.registrationUrl,
    });
  });

  test('Convert inexistant registration', () => {
    expect(convertRegistration()).toEqual({
      registration: [],
      registrationUrl: null,
    });
  });

  test('Convert keywords', () => {
    expect(convertKeywords(bordeauxEventV2.keywords)).toEqual(
      bordeauxEventV1.keywords,
    );
  });

  test('Convert age', () => {
    expect(convertAge(bordeauxEventV2.age)).toEqual(bordeauxEventV1.age);
  });

  test('Convert member to contributor', () => {
    expect(convertMember(false, { member: bordeauxEventV2.member })).toEqual({
      organization: 'Médiathèque',
    });
  });

  test("Return the event's permalink", () => {
    expect(getPermalink(bordeauxAgendaSettings, bordeauxEventV2)).toEqual(
      `https://openagenda.com/agendas/${bordeauxAgendaSettings.uid}/events/${bordeauxEventV2.uid}`,
    );
  });

  test('Return the custom fields', () => {
    expect(
      getCustom({ agendaSettings: bordeauxAgendaSettings }, bordeauxEventV2),
    ).toEqual(bordeauxEventV1.custom);
  });

  test('Return the category fields', () => {
    expect(getCategory(bordeauxAgendaSettings, bordeauxEventV2)).toEqual(
      bordeauxEventV1.category,
    );
  });
});

describe("Return the event's tagGroup", () => {
  test('Event without tags', () => {
    expect(getTags(bordeauxAgendaSettings, {})).toEqual({
      tags: [],
      tagGroups: [],
    });
  });

  test('Event with tags', () => {
    expect(getTags(lilleAgendaSettings, lilleEventV2)).toEqual({
      tagGroups: lilleEventV1.tagGroups,
      tags: lilleEventV1.tags,
    });
  });
});

describe('Fixes', () => {
  test('fieldSlug should strictly match with flattened tagSet values', () => {
    const result = flattenTagSet(
      JNAFlattenTagSet.tagSet,
      JNAFlattenTagSet.tagFields,
    );

    expect(result[0].fieldSlug).toBeUndefined();
    expect(result[1].fieldSlug).toBe(
      'cocher-la-case-si-vous-etes-en-lien-avec-un-partenaire-national-de-loperation-agenda',
    );
  });
});

test('Convert event version 2 to version 1', () => {
  delete bordeauxEventV1.hasPrivateCustomFields;

  const convertedContent = converEventLegacyFormat(
    bordeauxAgendaSettings,
    bordeauxEventV2,
  );
  expect(convertedContent).toMatchObject(bordeauxEventV1);
});

describe('An admin key allows access to restricted fields', () => {
  bordeauxAgendaSettings.admin = true;
  const convertedContent = converEventLegacyFormat(
    bordeauxAgendaSettings,
    bordeauxEventV2,
  );

  test('State is included', () => {
    expect(convertedContent.state).toBe(bordeauxEventV1.state);
  });

  test('All member fields are included', () => {
    expect(convertedContent.contributor).toEqual(bordeauxEventV1.contributor);
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
      renderHTMLFromMarkdown: () =>
        "<p>Un jeune dealer Noir de Brooklyn se retrouve coincé entre son mentor, un frère peu recommandable, et un policier Blanc, bien décidé à le faire condamner pour le meurtre d'un trafiquant du quartier.</p>\n",
    },
    root: 'https://openagenda.com',
  };

  const convertedContent = converEventLegacyFormat(
    meudonAgendaSettings,
    meudonEventV2,
  );
  expect(convertedContent).toMatchObject(meudonEventV1);
});
