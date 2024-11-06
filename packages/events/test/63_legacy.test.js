import _ from 'lodash';
import legacySet, { baseTransform } from '../lib/legacy/set.js';
import legacyRemove from '../lib/legacy/remove.js';
import { service as config } from '../testconfig.sample.js';
import Service from '../index.js';
import fixtures from './fixtures/index.js';
import petitesBoitesAMusique from './fixtures/petites-boites-a-musique.json';
import ventesVelosOccasion from './fixtures/ventes-de-velos-d-occasion-a-lambersart.json';
import indoorParisCsoPro from './fixtures/indoor-de-paris-cso-pro-1.json';
import enLigne from './fixtures/en-ligne.json';

const events = {
  'petites-boites-a-musique': petitesBoitesAMusique,
  'ventes-de-velos-d-occasion-a-lambersart': ventesVelosOccasion,
  'indoor-de-paris-cso-pro-1': indoorParisCsoPro,
  'en-ligne': enLigne,
};

const f = fixtures(config.mysql, config.schema);

describe('legacy', () => {
  describe('setFromLegacy', () => {
    let svc;
    let result;

    const eventUid = 27434489;

    beforeAll(async () => {
      await f.load();

      svc = Service({
        knex: f.client,
        imagePath: config.imagePath,
      });
    });

    beforeAll(async () => {
      result = await svc.setFromLegacy({ uid: eventUid });
    });

    it('create/update payload deriving from event is part of response', () => {
      expect(result.event).toEqual(events['indoor-de-paris-cso-pro-1']);
    });

    it('operation is given in response', () => {
      expect(result.operation).toBe('create');
    });

    it('event is created', async () => {
      expect(result.response.uid).toBe(result.event.uid);
    });
  });

  describe('legacySet', () => {
    describe('create', () => {
      beforeAll(async () => {
        await f.load();
      });

      describe('simple case', () => {
        let result;

        beforeAll(async () => {
          result = await legacySet(
            f.client,
            events['petites-boites-a-musique'],
          );
        });

        it('result contains event legacy id', () => {
          expect(typeof result.eventId).toBe('number');
        });

        it('result contains main operation type', () => {
          expect(result.operation).toBe('create');
        });

        it('event slug is same as provided', async () => {
          const { slug } = await f
            .client('event')
            .first('slug')
            .where('uid', events['petites-boites-a-musique'].uid);

          expect(events['petites-boites-a-musique'].slug).toBe(slug);
        });
      });
    });

    describe('remove', () => {
      let result;

      beforeAll(async () => {
        await f.load();
      });

      beforeAll(async () => {
        result = await legacyRemove(
          f.client,
          events['ventes-de-velos-d-occasion-a-lambersart'],
        );
      });

      it('result shows remove operation', () => {
        expect(result.operation).toBe('remove');
      });
    });

    describe('update', () => {
      let result;

      beforeAll(async () => {
        await f.load();
      });

      beforeAll(async () => {
        result = await legacySet(
          f.client,
          events['ventes-de-velos-d-occasion-a-lambersart'],
        );
      });

      it('result shows update operation', () => {
        expect(result.operation).toBe('update');
      });

      it('eventLocation reference was updated', async () => {
        const { location_id: locationId } = await f.client
          .first('location_id')
          .from('event_location')
          .where('event_id', 1);

        expect(locationId).toBe(4);
      });

      it('1 eventLocationTranslation entry was added', async () => {
        const entries = await f.client
          .select('elt.*')
          .from('event_location_translation as elt')
          .leftJoin('event_location as el', 'elt.id', 'el.id')
          .where('el.event_id', 1);

        expect(entries.length).toBe(1);
        expect(entries[0].pricing_info).toBe('Pas cher');
      });

      it('long description was emptied', async () => {
        const entries = await f.client
          .select()
          .from('event_translation')
          .where('id', 1);

        expect(entries[0].free_text).toBe('');
      });
    });

    describe('baseTransform', () => {
      const imageData = {
        filename: 'db7ab4eeac3249a5a57b5d315d608217.base.image.jpg',
        size: { width: 700, height: 565 },
        variants: [
          {
            filename: 'db7ab4eeac3249a5a57b5d315d608217.full.image.jpg',
            type: 'full',
          },
          {
            filename: 'db7ab4eeac3249a5a57b5d315d608217.thumb.image.jpg',
            type: 'thumbnail',
          },
        ],
      };

      it('title is placed in event_translation entry, one entry per language', () => {
        const et = baseTransform({
          title: {
            fr: 'Un événement',
          },
        }).event_translation;

        expect(et[0].title).toBe('Un événement');
        expect(et[0].lang).toBe('fr');
      });

      it('uid is placed in event entry', () => {
        const entry = baseTransform({
          uid: 123,
        });

        expect(entry.event.uid).toBe(123);
      });

      it('legacy goes to a jsonified array', () => {
        const entry = baseTransform({
          accessibility: {
            hi: true,
            ii: false,
          },
        }).event;

        expect(entry.accessibility).toBe('["hi"]');
      });

      it('image filename is placed in image column', () => {
        const entry = baseTransform({
          image: imageData,
        }).event;

        expect(entry.image).toBe(
          'db7ab4eeac3249a5a57b5d315d608217.base.image.jpg',
        );
      });

      it('remaining image paths is placed in store', () => {
        const entry = baseTransform({
          image: imageData,
        }).event;

        expect(entry.store).toBe(
          '{"images":{"filename":"db7ab4eeac3249a5a57b5d315d608217.base.image.jpg","size":{"width":700,"height":565},"variants":[{"filename":"db7ab4eeac3249a5a57b5d315d608217.full.image.jpg","type":"full"},{"filename":"db7ab4eeac3249a5a57b5d315d608217.thumb.image.jpg","type":"thumbnail"}]},"links":[]}',
        );
      });

      it('image credits is placed in event entry', () => {
        const entry = baseTransform({
          imageCredits: 'C ma foto',
        }).event;

        expect(entry.image_credits).toBe('C ma foto');
      });

      it('age goes in age_min and age_max', () => {
        const entry = baseTransform({
          age: { min: 20, max: 80 },
        }).event;

        expect(entry.age_min).toBe(20);
        expect(entry.age_max).toBe(80);
      });

      it('location id is specified in event_location entry', () => {
        const entry = baseTransform({}, { locationId: 1 });

        expect(entry.event_location.location_id).toBe(1);
      });

      it('ticket_link is a concatenation of registration field', () => {
        const entry = baseTransform({
          registration: [
            'https://openagenda.com',
            'https://agenda.grand-albigeois.fr',
          ],
        });

        expect(entry.event_location.ticket_link).toBe(
          'https://openagenda.com, https://agenda.grand-albigeois.fr',
        );
      });

      it('occurrences derive from timings', () => {
        const entry = baseTransform(
          {
            timings: [
              {
                begin: '2020-12-18T17:00:00.000Z',
                end: '2020-12-18T19:00:00.000Z',
              },
            ],
            locationUid: 222,
            timezone: 'Europe/Paris',
          },
          { locationId: 2 },
        );

        expect(
          _.omit(entry.occurrence[0], ['created_at', 'updated_at']),
        ).toEqual({
          date: '2020-12-18',
          time_start: '18:00',
          time_end: '20:00',
          location_id: 2,
        });
      });

      it('event_location_translation.pricing_info derives from conditions', () => {
        const entry = baseTransform({
          conditions: {
            fr: 'Gratuit',
            en: 'Free',
          },
        });

        expect(
          entry.event_location_translation.map((elt) =>
            _.omit(elt, ['updated_at'])),
        ).toEqual([
          {
            lang: 'fr',
            pricing_info: 'Gratuit',
          },
          {
            lang: 'en',
            pricing_info: 'Free',
          },
        ]);
      });

      it('attendanceMode and onlineAccessLink are placed in event store', () => {
        const entry = baseTransform(events['en-ligne']);

        expect(entry.event.store).toBe(
          '{"attendanceMode":2,"onlineAccessLink":"https://online.access.link.com","links":[]}',
        );
      });

      it('event_location location_id ref is null for strictly online event', () => {
        const entry = baseTransform(events['en-ligne']);

        expect(entry.event_location.location_id).toBeNull();
      });
    });
  });
});
