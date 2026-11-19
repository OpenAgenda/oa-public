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
      // A cancelled event offers nothing, registration link or not.
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
  const date = {
    begin: '2099-12-05T20:00:00+01:00',
    end: '2099-12-05T22:00:00+01:00',
  };

  const base = {
    title: { fr: 'Chers parents' },
    description: { fr: 'Une comédie.' },
    timezone: 'Europe/Paris',
    attendanceMode: 1,
    status: 1,
    timings: [date],
    registration: [
      { type: 'link', value: 'https://theatre.example/chers-parents' },
    ],
  };

  const summary = (over = {}) => ({
    availability: null,
    price: null,
    links: null,
    ...over,
  });

  const offersOf = (event, options = {}) =>
    toEventSchema(event, { formatDate, ...options }).offers;

  // One date described on its own: the caller says so with `timing`.
  const dateOffersOf = (event, timing, options = {}) =>
    offersOf(event, { timing, ...options });

  describe('the whole event', () => {
    it('publishes the lowest price, its currency, the booking link and the availability', () => {
      expect(
        offersOf({
          ...base,
          offersAggregate: summary({
            availability: 'available',
            pricing: 'paid',
            price: { minCents: 1100, maxCents: 2300, currency: 'EUR' },
            links: [
              { provider: 'mapado', url: 'https://theatre.mapado.com/event/1' },
            ],
          }),
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
          offersAggregate: summary({
            availability: 'available',
            price: { minCents: 1500, maxCents: 1500, currency: 'JPY' },
          }),
        }).price,
      ).toBe(1500);
    });

    it('a free event is priced 0', () => {
      expect(
        offersOf({
          ...base,
          offersAggregate: summary({
            pricing: 'free',
            price: { minCents: 0, maxCents: 0, currency: 'EUR' },
          }),
        }).price,
      ).toBe(0);
    });

    it.each([
      ['a pay-what-you-want floor', 'donation', null],
      ['a free tier beside paid ones', 'mixed', 1500],
    ])('%s of 0 is not published as a free price', (_, pricing, maxCents) => {
      const offers = offersOf({
        ...base,
        offersAggregate: summary({
          pricing,
          price: { minCents: 0, maxCents, currency: 'EUR' },
        }),
      });

      expect(offers.price).toBeUndefined();
      expect(offers.priceCurrency).toBeUndefined();
    });

    it('leaves the price out when it cannot be read', () => {
      expect(
        offersOf({
          ...base,
          offersAggregate: summary({
            price: { minCents: 1100, maxCents: 2300, currency: 'XXZ' },
          }),
        }).price,
      ).toBeUndefined();
    });

    it.each([
      ['available', 'https://schema.org/InStock'],
      ['limited', 'https://schema.org/InStock'],
      ['soldOut', 'https://schema.org/SoldOut'],
    ])('%s becomes %s', (availability, expected) => {
      expect(
        offersOf({ ...base, offersAggregate: summary({ availability }) })
          .availability,
      ).toBe(expected);
    });

    it.each([
      'notYetOnSale',
      'salesClosed',
      'mixed',
      'unknown',
      null,
      'constructor',
      'toString',
    ])(
      '%s leaves availability out rather than claiming InStock',
      (availability) => {
        expect(
          offersOf({ ...base, offersAggregate: summary({ availability }) }),
        ).toEqual({
          '@type': 'Offer',
          url: 'https://theatre.example/chers-parents',
        });
      },
    );

    it('a full event is sold out even when the catalogue has no rows', () => {
      expect(
        offersOf({ ...base, status: 5, offersAggregate: summary() })
          .availability,
      ).toBe('https://schema.org/SoldOut');
    });

    it.each([
      ['an id', 6],
      ['a numeric string', '6'],
      ['an object', { id: 6, label: 'Annulé' }],
    ])('a cancelled event, status as %s, offers nothing', (_, status) => {
      expect(
        offersOf({
          ...base,
          status,
          offersAggregate: summary({
            availability: 'salesClosed',
            price: { minCents: 1100, maxCents: 1100, currency: 'EUR' },
            links: [
              { provider: 'mapado', url: 'https://theatre.mapado.com/1' },
            ],
          }),
        }),
      ).toBeUndefined();
    });

    it.each([
      ['a numeric string', '5'],
      ['an object', { id: 5 }],
    ])('reads a full status given as %s', (_, status) => {
      expect(
        offersOf({
          ...base,
          status,
          offersAggregate: summary({ availability: 'available' }),
        }).availability,
      ).toBe('https://schema.org/SoldOut');
    });

    it('a one-date event is still described as an event without `timing`', () => {
      expect(
        offersOf({
          ...base,
          timings: [{ ...date, availability: [] }],
          offersAggregate: summary({ availability: 'available' }),
        }).availability,
      ).toBe('https://schema.org/InStock');
    });

    it('emits no offer when the summary says nothing and there is no link', () => {
      expect(
        offersOf({
          ...base,
          registration: [],
          offersAggregate: summary({ availability: 'mixed' }),
        }),
      ).toBeUndefined();
    });
  });

  describe('one date (`timing`)', () => {
    const event = {
      ...base,
      offersAggregate: summary({
        availability: 'available',
        links: [
          { provider: 'billetweb', url: 'https://billetweb.fr/a' },
          { provider: 'mapado', url: 'https://theatre.mapado.com/event/1' },
        ],
      }),
    };

    it('reads its own rows, not the event summary', () => {
      expect(
        dateOffersOf(event, {
          ...date,
          availability: [
            { provider: 'mapado', status: 'soldOut' },
            { provider: 'billetweb', status: 'soldOut' },
          ],
        }).availability,
      ).toBe('https://schema.org/SoldOut');
    });

    it('is InStock as soon as one source still sells', () => {
      expect(
        dateOffersOf(event, {
          ...date,
          availability: [
            { provider: 'mapado', status: 'soldOut' },
            { provider: 'billetweb', status: 'limited' },
          ],
        }).availability,
      ).toBe('https://schema.org/InStock');
    });

    it.each([
      ['no rows at all', undefined],
      ['an empty list', []],
    ])('with %s says nothing, never the summary', (_, availability) => {
      // No stock, no safe link (two sources), no price: no offer at all.
      expect(dateOffersOf(event, { ...date, availability })).toBeUndefined();
    });

    it('ignores rows outside the status list, as the event page does', () => {
      expect(
        dateOffersOf(event, {
          ...date,
          availability: [
            { provider: 'mapado', status: 'soldOut' },
            { provider: 'billetweb', status: 'whatever' },
            null,
          ],
        }).availability,
      ).toBe('https://schema.org/SoldOut');
    });

    it('links to the page of the source that sells, not to a sold-out one', () => {
      expect(
        dateOffersOf(event, {
          ...date,
          availability: [
            {
              provider: 'mapado',
              status: 'soldOut',
              bookingUrl: 'https://theatre.mapado.com/event/1?eventDate=9',
            },
            { provider: 'billetweb', status: 'available' },
          ],
        }).url,
      ).toBe('https://billetweb.fr/a');
    });

    it("prefers the selling source's own page for that date", () => {
      expect(
        dateOffersOf(event, {
          ...date,
          availability: [
            {
              provider: 'mapado',
              status: 'available',
              bookingUrl: 'https://theatre.mapado.com/event/1?eventDate=9',
            },
          ],
        }).url,
      ).toBe('https://theatre.mapado.com/event/1?eventDate=9');
    });

    it('takes the first selling source that has a page for the date', () => {
      expect(
        dateOffersOf(
          {
            ...event,
            offersAggregate: { ...event.offersAggregate, links: null },
          },
          {
            ...date,
            availability: [
              { provider: 'helloasso', status: 'available' },
              {
                provider: 'billetweb',
                status: 'available',
                bookingUrl: 'https://billetweb.fr/x?d=9',
              },
            ],
          },
        ).url,
      ).toBe('https://billetweb.fr/x?d=9');
    });

    it('with no rows, borrows no catalogue link when several sources may sell', () => {
      expect(dateOffersOf(event, { ...date })).toBeUndefined();
    });

    it('with no rows, uses the catalogue link of a single source', () => {
      expect(
        dateOffersOf(
          {
            ...event,
            offersAggregate: {
              ...event.offersAggregate,
              links: [
                { provider: 'mapado', url: 'https://theatre.mapado.com/1' },
              ],
            },
          },
          { ...date },
        ).url,
      ).toBe('https://theatre.mapado.com/1');
    });

    it('a past date offers nothing: no price, no link, no stock', () => {
      expect(
        dateOffersOf(
          {
            ...event,
            offersAggregate: {
              ...event.offersAggregate,
              price: { minCents: 1100, maxCents: 1100, currency: 'EUR' },
            },
          },
          {
            ...date,
            availability: [{ provider: 'mapado', status: 'available' }],
          },
          { now: new Date('2100-01-01T00:00:00Z') },
        ),
      ).toBeUndefined();
    });

    it('a past date given as epoch milliseconds offers nothing either', () => {
      expect(
        dateOffersOf(
          event,
          {
            begin: Date.parse(date.begin),
            end: Date.parse(date.end),
            availability: [{ provider: 'mapado', status: 'available' }],
          },
          { now: Date.parse('2100-01-01T00:00:00Z') },
        ),
      ).toBeUndefined();
    });

    it('a selling source with no link of its own leaves the URL out', () => {
      const offers = dateOffersOf(
        {
          ...event,
          offersAggregate: {
            ...event.offersAggregate,
            links: [{ provider: 'billetweb', url: 'https://billetweb.fr/a' }],
          },
        },
        {
          ...date,
          availability: [
            { provider: 'billetweb', status: 'soldOut' },
            { provider: 'helloasso', status: 'available' },
          ],
        },
      );

      expect(offers.url).toBeUndefined();
      expect(offers.availability).toBe('https://schema.org/InStock');
    });

    it('describes that date, not the first one of the event', () => {
      const second = {
        begin: '2099-12-06T20:00:00+01:00',
        end: '2099-12-06T22:00:00+01:00',
      };
      const schema = toEventSchema(
        { ...event, timings: [date, second] },
        { formatDate, timing: second },
      );

      expect(schema.startDate).toBe('2099-12-06T20:00:00+01:00');
      expect(schema.endDate).toBe('2099-12-06T22:00:00+01:00');
    });
  });

  it('a null `now` is the current time', () => {
    expect(
      offersOf(
        { ...base, offersAggregate: summary({ availability: 'available' }) },
        { now: null },
      ).availability,
    ).toBe('https://schema.org/InStock');
  });

  it('reads eventStatus from a numeric-string status, like the offer does', () => {
    const schema = toEventSchema(
      { ...base, status: '6', offersAggregate: summary() },
      { formatDate },
    );

    expect(schema.eventStatus).toBe('https://schema.org/EventCancelled');
    expect(schema.offers).toBeUndefined();
  });

  it('refuses a `now` that is not an instant', () => {
    expect(() =>
      offersOf(
        { ...base, offersAggregate: summary() },
        { now: '2100-01-01T00:00:00Z' },
      )).toThrow(TypeError);
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
