import { formatInTimeZone } from 'date-fns-tz';
import { toEventSchema } from '../src/index.js';

function formatDate(date, tz = 'Europe/Paris') {
  return formatInTimeZone(date, tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

describe('toEventSchema', () => {
  it('offline event returns valid schema', () => {
    expect(
      toEventSchema(
        {
          longDescription: {
            fr: "Information des acteurs locaux sur les supports de diffusion en matière d'information et de promotion de la santé.\nPrésentation d'outils pédagogiques ludique disponibles en prêt.\nAccompagnement et conseils pour la mise en place de projets.",
          },
          country: {
            de: 'Frankreich (Metropolitan)',
            code: 'FR',
            oc: 'França (Metropolitana)',
            en: 'France (Metropolitan)',
            it: 'Francia (continente)',
            fr: 'France (Métropole)',
            es: 'Francia (Metropolitana)',
          },
          featured: false,
          private: 0,
          keywords: {
            fr: [
              'réseaux',
              'écrans',
              'santé',
              'outils',
              'information',
              'prévention',
            ],
          },
          accessibility: {
            ii: false,
            hi: false,
            vi: false,
            pi: false,
            mi: true,
          },
          dateRange: {
            ar: 'الخميس ٢٣ فبراير, 09:00',
            de: 'Donnerstag 23 Februar, 09:00',
            en: 'Thursday 23 February, 09:00',
            it: 'Giovedì 23 febbraio, 09:00',
            fr: 'Jeudi 23 février, 09h00',
            es: 'Jueves 23 febrero, 09:00',
          },
          timezone: 'Europe/Paris',
          imageCredits: null,
          originAgenda: {
            image: 'agenda7058537.jpg',
            uid: 7058537,
            title: 'Société Châtellerault',
          },
          description: {
            fr: "Découverte d'outils d'information et de prévention sur les réseaux et les écrans.",
          },
          title: {
            fr: 'Permanence IREPS sur les écrans et les réseaux',
          },
          onlineAccessLink: null,
          createdAt: '2022-08-08T12:59:26.000Z',
          uid: 69271537,
          draft: 0,
          timings: [
            {
              begin: '2023-02-23T09:00:00+01:00',
              end: '2023-02-23T12:00:00+01:00',
            },
          ],
          links: [],
          state: 2,
          slug: 'permanence-ireps-sur-les-ecrans-et-les-reseaux',
          updatedAt: '2022-08-08T12:59:42.000Z',
          addMethod: 'aggregation',
          image: {
            filename: 'c3e0a7f7ec504f04839927e8375c0159.base.image.jpg',
            size: {
              width: 700,
              height: 989,
            },
            variants: [
              {
                filename: 'c3e0a7f7ec504f04839927e8375c0159.full.image.jpg',
                size: {
                  width: 1755,
                  height: 2480,
                },
                type: 'full',
              },
              {
                filename: 'c3e0a7f7ec504f04839927e8375c0159.thumb.image.jpg',
                size: {
                  width: 200,
                  height: 200,
                },
                type: 'thumbnail',
              },
            ],
            base: 'https://cdn.openagenda.com/dev/',
          },
          attendanceMode: 1,
          particularites: [14],
          sourceAgendas: [
            {
              image: 'agenda7058537.jpg',
              private: 0,
              indexed: 1,
              locationSetUid: null,
              official: 1,
              description:
                'Retrouvez tous les événements de la thématique Société sur Châtellerault',
              title: 'Société Châtellerault',
              url: 'https://www.ville-chatellerault.fr/',
              _agg: 'eyJ1aWQiOjcwNTg1MzcsInRpdGxlIjoiU29jacOpdMOpIENow6J0ZWxsZXJhdWx0IiwiaW1hZ2UiOiJhZ2VuZGE3MDU4NTM3LmpwZyJ9',
              uid: 7058537,
              createdAt: '2018-04-24T08:21:20.000Z',
              officializedAt: '2019-04-11T14:10:05.000Z',
              slug: 'societe-chatellerault',
              updatedAt: '2022-12-20T10:00:25.000Z',
            },
          ],
          creatorUid: 92289656,
          equipement: 6,
          'thematique-social-societe': 35,
          registration: [
            {
              type: 'phone',
              value: '05 49 23 70 00',
            },
            {
              type: 'email',
              value: 'le4@grand-chatellerault.fr',
            },
          ],
          location: {
            disqualifiedDuplicates: null,
            access: {},
            city: 'Châtellerault',
            timezone: 'Europe/Paris',
            postalCode: '86100',
            latitude: 46.809767,
            imageCredits: null,
            description: {},
            setUid: null,
            uid: 27572659,
            createdAt: '2018-09-07T14:04:57.000Z',
            duplicateCandidates: [],
            countryCode: 'FR',
            adminLevel5: null,
            links: [],
            state: 1,
            extId: null,
            department: 'Vienne',
            slug: 'le-4-chatellerault',
            email: null,
            longitude: 0.542259,
            updatedAt: '2021-07-16T17:38:52.000Z',
            image: null,
            website: null,
            address: '4 rue Aimé Rasseteau Châtellerault',
            adminLevel3: null,
            agendaUid: 7058537,
            adminLevel1: 'Nouvelle-Aquitaine',
            adminLevel2: 'Vienne',
            mergedIn: null,
            _agg: 'eyJ1aWQiOjI3NTcyNjU5LCJuYW1lIjoiTGUgNCBDaMOidGVsbGVyYXVsdCJ9',
            tags: null,
            insee: '86066',
            phone: null,
            district: null,
            name: 'Le 4 Châtellerault',
            region: 'Nouvelle-Aquitaine',
          },
          ownerUid: 92289656,
          conditions: {
            fr: 'Entrée libre, gratuit',
          },
          age: {
            min: null,
            max: null,
          },
          status: 1,
          lastTiming: {
            begin: '2023-02-23T09:00:00+01:00',
            end: '2023-02-23T12:00:00+01:00',
          },
          nextTiming: {
            begin: '2023-02-23T09:00:00+01:00',
            end: '2023-02-23T12:00:00+01:00',
          },
        },
        {
          formatDate,
          url: 'https://openagenda.com/events/permanence-ireps-sur-les-ecrans-et-les-reseaux',
        },
      ),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Event',
      '@id':
        'https://openagenda.com/events/permanence-ireps-sur-les-ecrans-et-les-reseaux',
      name: 'Permanence IREPS sur les écrans et les réseaux',
      description:
        "Découverte d'outils d'information et de prévention sur les réseaux et les écrans.",
      url: 'https://openagenda.com/events/permanence-ireps-sur-les-ecrans-et-les-reseaux',
      image:
        'https://cdn.openagenda.com/dev/c3e0a7f7ec504f04839927e8375c0159.base.image.jpg',
      startDate: '2023-02-23T09:00:00+01:00',
      endDate: '2023-02-23T12:00:00+01:00',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: 'Le 4 Châtellerault',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '4 rue Aimé Rasseteau Châtellerault',
          addressLocality: 'Châtellerault',
          addressRegion: 'Nouvelle-Aquitaine',
          postalCode: '86100',
          addressCountry: 'FR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 46.809767,
          longitude: 0.542259,
        },
      },
    });
  });

  it('online event returns valid schema', () => {
    expect(
      toEventSchema(
        {
          longDescription: {},
          featured: false,
          private: 0,
          keywords: {},
          accessibility: {
            ii: false,
            hi: false,
            vi: false,
            pi: false,
            mi: false,
          },
          dateRange: {
            ar: '١٣ مارس - ٢٦ نوفمبر ٢٠٢١',
            de: '13 März - 26 November 2021',
            en: '13 March - 26 November 2021',
            fr: '13 mars - 26 novembre 2021',
            es: '13 marzo - 26 noviembre 2021',
          },
          timezone: 'Europe/Paris',
          originAgenda: {
            image: 'agenda39293149.jpg?__ts=1652705335470',
            uid: 39293149,
            title: 'Test Evénements en ligne',
          },
          description: {
            fr: 'test',
          },
          title: {
            fr: 'Un événement en ligne',
          },
          onlineAccessLink: 'https://oa.com',
          createdAt: '2021-03-08T13:47:45.000Z',
          uid: 64825695,
          draft: 0,
          timings: [
            {
              begin: '2021-03-13T10:00:00+01:00',
              end: '2021-03-13T13:30:00+01:00',
            },
            {
              begin: '2021-05-15T06:30:00+02:00',
              end: '2021-05-15T10:30:00+02:00',
            },
            {
              begin: '2021-11-13T08:00:00+01:00',
              end: '2021-11-13T12:00:00+01:00',
            },
            {
              begin: '2021-11-26T04:30:00+01:00',
              end: '2021-11-26T11:00:00+01:00',
            },
          ],
          member: {
            uid: 75052324,
            role: 2,
            phone: null,
            organization: null,
            name: null,
            position: null,
            email: null,
            _agg: 'eyJ1aWQiOjc1MDUyMzI0LCJuYW1lIjpudWxsfQ==',
          },
          links: [],
          state: 2,
          slug: 'un-evenement-en-ligne',
          updatedAt: '2021-10-04T15:22:43.000Z',
          addMethod: 'contribution',
          image: null,
          attendanceMode: 2,
          sourceAgendas: [],
          creatorUid: 75052324,
          registration: [
            {
              type: 'link',
              value: 'https://registration.com',
            },
          ],
          ownerUid: 75052324,
          conditions: {},
          age: {},
          status: 6,
          lastTiming: {
            begin: '2021-11-26T04:30:00+01:00',
            end: '2021-11-26T11:00:00+01:00',
          },
          nextTiming: null,
        },
        {
          formatDate,
          url: 'https://openagenda.com/events/un-evenement-en-ligne',
        },
      ),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Event',
      '@id': 'https://openagenda.com/events/un-evenement-en-ligne',
      url: 'https://openagenda.com/events/un-evenement-en-ligne',
      name: 'Un événement en ligne',
      description: 'test',
      startDate: '2021-03-13T10:00:00+01:00',
      endDate: '2021-11-26T11:00:00+01:00',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventCancelled',
      offers: {
        '@type': 'Offer',
        url: 'https://registration.com',
        availability: 'https://schema.org/InStock',
      },
    });
  });

  it('mixed event returns valid schema', () => {
    expect(
      toEventSchema(
        {
          longDescription: {},
          country: {
            de: 'Frankreich (Metropolitan)',
            code: 'FR',
            oc: 'França (Metropolitana)',
            en: 'France (Metropolitan)',
            it: 'Francia (continente)',
            fr: 'France (Métropole)',
            es: 'Francia (Metropolitana)',
          },
          featured: false,
          private: 0,
          keywords: {},
          accessibility: {
            ii: false,
            hi: false,
            vi: false,
            pi: false,
            mi: false,
          },
          dateRange: {
            ar: 'الأحد ٦ يونيو ٢٠٢١, 10:00',
            de: 'Sonntag 6 Juni 2021, 10:00',
            en: 'Sunday 6 June 2021, 10:00',
            fr: 'Dimanche 6 juin 2021, 10h00',
            es: 'Domingo 6 junio 2021, 10:00',
          },
          timezone: 'Europe/Paris',
          originAgenda: {
            image: 'agenda39293149.jpg?__ts=1652705335470',
            uid: 39293149,
            title: 'Test Evénements en ligne',
          },
          description: {
            fr: 'test',
          },
          title: {
            fr: 'Un événement mixte',
          },
          onlineAccessLink: 'https://oa.com',
          createdAt: '2021-06-02T07:10:41.000Z',
          uid: 68683984,
          draft: 0,
          timings: [
            {
              begin: '2021-06-06T10:00:00+02:00',
              end: '2021-06-06T13:00:00+02:00',
            },
          ],
          member: {
            uid: 75052324,
            role: 2,
            phone: null,
            organization: null,
            name: null,
            position: null,
            email: null,
            _agg: 'eyJ1aWQiOjc1MDUyMzI0LCJuYW1lIjpudWxsfQ==',
          },
          links: [],
          state: 2,
          slug: 'un-evenement-mixte',
          updatedAt: '2021-06-02T07:10:41.000Z',
          addMethod: 'contribution',
          image: null,
          attendanceMode: 3,
          sourceAgendas: [],
          creatorUid: 75052324,
          registration: [],
          location: {
            disqualifiedDuplicates: null,
            access: {},
            city: null,
            timezone: 'Europe/Paris',
            postalCode: '49480',
            latitude: 47.498993,
            imageCredits: null,
            description: {},
            setUid: null,
            uid: 38652578,
            createdAt: '2021-03-08T13:46:47.000Z',
            duplicateCandidates: [],
            countryCode: 'FR',
            adminLevel5: null,
            links: [],
            state: 0,
            extId: null,
            department: 'Maine-et-Loire',
            slug: 'un-lieu_6830036',
            email: null,
            longitude: -0.49041,
            updatedAt: '2021-07-17T01:15:25.000Z',
            image: null,
            website: null,
            address: 'Lieu',
            adminLevel3: null,
            agendaUid: 39293149,
            adminLevel1: 'Pays de la Loire',
            adminLevel2: 'Maine-et-Loire',
            mergedIn: null,
            _agg: 'eyJ1aWQiOjM4NjUyNTc4LCJuYW1lIjoiVW4gbGlldSJ9',
            tags: null,
            insee: '18093',
            phone: null,
            district: "Saint-Sylvain-d'Anjou",
            name: 'Un lieu',
            region: 'Pays de la Loire',
          },
          ownerUid: 75052324,
          conditions: {},
          age: {},
          status: 1,
          lastTiming: {
            begin: '2021-06-06T10:00:00+02:00',
            end: '2021-06-06T13:00:00+02:00',
          },
          nextTiming: null,
        },
        {
          formatDate,
          url: 'https://openagenda.com/events/un-evenement-mixte',
        },
      ),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Event',
      '@id': 'https://openagenda.com/events/un-evenement-mixte',
      url: 'https://openagenda.com/events/un-evenement-mixte',
      name: 'Un événement mixte',
      description: 'test',
      startDate: '2021-06-06T10:00:00+02:00',
      endDate: '2021-06-06T13:00:00+02:00',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: 'Un lieu',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Lieu',
          addressLocality: null,
          addressRegion: 'Pays de la Loire',
          postalCode: '49480',
          addressCountry: 'FR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 47.498993,
          longitude: -0.49041,
        },
      },
    });
  });
});

describe('toEventSchema - ticketing offers', () => {
  const base = {
    title: { fr: 'Chers parents' },
    description: { fr: 'Une comédie.' },
    timezone: 'Europe/Paris',
    attendanceMode: 1,
    status: 1,
    timings: [
      {
        begin: '2099-12-05T20:00:00+01:00',
        end: '2099-12-05T22:00:00+01:00',
      },
    ],
    registration: [
      { type: 'link', value: 'https://theatre.example/chers-parents' },
    ],
  };

  const offersOf = (event) => toEventSchema(event, { formatDate }).offers;

  it('publishes the lowest price, its currency, the booking link and the availability', () => {
    expect(
      offersOf({
        ...base,
        offersAggregate: {
          availability: 'available',
          pricing: 'paid',
          price: { minCents: 1100, maxCents: 2300, currency: 'EUR' },
          links: [
            { provider: 'mapado', url: 'https://theatre.mapado.com/event/1' },
          ],
        },
      }),
    ).toEqual({
      '@type': 'Offer',
      url: 'https://theatre.mapado.com/event/1',
      price: 11,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    });
  });

  it('converts with the currency exponent, not a fixed 100', () => {
    expect(
      offersOf({
        ...base,
        offersAggregate: {
          availability: 'available',
          price: { minCents: 1500, maxCents: 1500, currency: 'JPY' },
          links: null,
        },
      }).price,
    ).toBe(1500);
  });

  it('a free event is priced 0', () => {
    expect(
      offersOf({
        ...base,
        offersAggregate: {
          availability: 'available',
          pricing: 'free',
          price: { minCents: 0, maxCents: 0, currency: 'EUR' },
          links: null,
        },
      }).price,
    ).toBe(0);
  });

  it.each([
    ['available', 'https://schema.org/InStock'],
    ['limited', 'https://schema.org/InStock'],
    ['soldOut', 'https://schema.org/SoldOut'],
  ])('%s becomes %s', (availability, expected) => {
    expect(
      offersOf({
        ...base,
        offersAggregate: { availability, price: null, links: null },
      }).availability,
    ).toBe(expected);
  });

  it.each(['notYetOnSale', 'salesClosed', 'mixed', 'unknown', null])(
    '%s leaves availability out rather than claiming InStock',
    (availability) => {
      const offers = offersOf({
        ...base,
        offersAggregate: { availability, price: null, links: null },
      });

      expect(offers).toEqual({
        '@type': 'Offer',
        url: 'https://theatre.example/chers-parents',
      });
    },
  );

  it('falls back to the registration link when no source carries a URL', () => {
    expect(
      offersOf({
        ...base,
        offersAggregate: { availability: 'soldOut', price: null, links: null },
      }).url,
    ).toBe('https://theatre.example/chers-parents');
  });

  it('leaves the price out when it cannot be read', () => {
    const offers = offersOf({
      ...base,
      offersAggregate: {
        availability: 'available',
        price: { minCents: 1100, maxCents: 2300, currency: 'XXZ' },
        links: null,
      },
    });

    expect(offers.price).toBeUndefined();
    expect(offers.priceCurrency).toBeUndefined();
  });

  it('emits no offer when the summary says nothing and there is no link', () => {
    expect(
      offersOf({
        ...base,
        registration: [],
        offersAggregate: { availability: 'mixed', price: null, links: null },
      }),
    ).toBeUndefined();
  });

  it('a single date reads its own rows, not the event summary', () => {
    const offers = offersOf({
      ...base,
      timings: [
        {
          ...base.timings[0],
          availability: [
            { provider: 'mapado', status: 'soldOut' },
            { provider: 'billetweb', status: 'soldOut' },
          ],
        },
      ],
      offersAggregate: { availability: 'available', price: null, links: null },
    });

    expect(offers.availability).toBe('https://schema.org/SoldOut');
  });

  it('a single date with one source still selling is InStock', () => {
    expect(
      offersOf({
        ...base,
        timings: [
          {
            ...base.timings[0],
            availability: [
              { provider: 'mapado', status: 'soldOut' },
              { provider: 'billetweb', status: 'limited' },
            ],
          },
        ],
        offersAggregate: { availability: 'mixed', price: null, links: null },
      }).availability,
    ).toBe('https://schema.org/InStock');
  });

  it('a cancelled event keeps no booking link', () => {
    expect(
      offersOf({
        ...base,
        status: 6,
        offersAggregate: {
          availability: 'salesClosed',
          price: { minCents: 1100, maxCents: 1100, currency: 'EUR' },
          links: null,
        },
      }),
    ).toEqual({ '@type': 'Offer', price: 11, priceCurrency: 'EUR' });
  });

  it('a full event is sold out even when the catalogue has no rows', () => {
    expect(
      offersOf({
        ...base,
        status: 5,
        offersAggregate: { availability: null, price: null, links: null },
      }).availability,
    ).toBe('https://schema.org/SoldOut');
  });

  it('a single date links to its own booking page, from a source that still sells', () => {
    expect(
      offersOf({
        ...base,
        timings: [
          {
            ...base.timings[0],
            availability: [
              {
                provider: 'billetweb',
                status: 'soldOut',
                bookingUrl: 'https://billetweb.fr/a?date=1',
              },
              {
                provider: 'mapado',
                status: 'available',
                bookingUrl: 'https://theatre.mapado.com/event/1?eventDate=9',
              },
            ],
          },
        ],
        offersAggregate: {
          availability: 'available',
          price: null,
          links: [{ provider: 'billetweb', url: 'https://billetweb.fr/a' }],
        },
      }).url,
    ).toBe('https://theatre.mapado.com/event/1?eventDate=9');
  });

  it('a past date claims no availability', () => {
    const { offers } = toEventSchema(
      {
        ...base,
        timings: [
          {
            ...base.timings[0],
            availability: [{ provider: 'mapado', status: 'available' }],
          },
        ],
        offersAggregate: { availability: null, price: null, links: null },
      },
      { formatDate, now: Date.parse('2100-01-01T00:00:00Z') },
    );

    expect(offers.availability).toBeUndefined();
  });

  it('a pay-what-you-want floor of 0 is not published as a free price', () => {
    const offers = offersOf({
      ...base,
      offersAggregate: {
        availability: 'available',
        pricing: 'donation',
        price: { minCents: 0, maxCents: null, currency: 'EUR' },
        links: null,
      },
    });

    expect(offers.price).toBeUndefined();
    expect(offers.priceCurrency).toBeUndefined();
  });

  it('reads the event status given as an object', () => {
    expect(
      offersOf({
        ...base,
        status: { id: 6, label: 'Annulé' },
        offersAggregate: {
          availability: 'salesClosed',
          price: null,
          links: null,
        },
      }),
    ).toBeUndefined();
    expect(
      offersOf({
        ...base,
        status: { id: 5 },
        offersAggregate: { availability: null, price: null, links: null },
      }).availability,
    ).toBe('https://schema.org/SoldOut');
  });

  it('an event without a catalogue keeps its registration-link offer', () => {
    expect(offersOf(base)).toEqual({
      '@type': 'Offer',
      url: 'https://theatre.example/chers-parents',
      availability: 'https://schema.org/InStock',
    });
    expect(offersOf({ ...base, status: 5 }).availability).toBe(
      'https://schema.org/SoldOut',
    );
  });
});
