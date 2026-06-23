import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import { withTestServer } from './helpers/startTestServer.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'bull',
  'files',
  'events',
  'agendas',
  'agendaEvents',
  'aggregators',
  'agendaLocations',
  'registrations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
  'accessTokens',
  'tracker',
];

describe('core - functional (server): core.agendas().events.update()', () => {
  let core;

  const config = testConfig.extendWith({
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test_events_update',
    },
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['004.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    await services.formSchemas.clearCache();

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(17026855).events.search.rebuild();
    await core.agendas(9491431).events.search.rebuild();
    await core.agendas(89904399).events.search.rebuild();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    describe('simple update', () => {
      let event;

      beforeAll(async () => {
        try {
          event = await core.agendas(17026855).events.update(
            19201989,
            {
              state: 0,
              featured: true,
              title: {
                fr: 'Un événement mis à jour',
                en: 'An updated event',
              },
              description: {
                fr: 'Une description',
                en: 'A desc',
              },
              location: {
                uid: 123,
              },
              attendanceMode: 2,
              onlineAccessLink: 'https://openagenda.com',
              timings: [
                {
                  begin: new Date('2019-05-06T10:00:00'),
                  end: new Date('2019-05-06T11:00:00'),
                },
                {
                  begin: new Date('2019-05-06T12:00:00'),
                  end: new Date('2019-05-06T13:00:00'),
                },
              ],
              custom_description: 'Meh',
              'categories-agenda-metropolitain': 43,
              'thematiques-bordeaux-metropole': [3],
            },
            {
              access: 'administrator',
              detailed: true,
            },
          );
        } catch (e) {
          // console.log(e);
        }
      });

      describe('response', () => {
        it('updated event is provided as a response', () => {
          expect(event.uid).toBe(19201989);
          expect(event.title.fr).toBe('Un événement mis à jour');
        });

        it('updated state is provided in response', () => {
          expect(event.state).toBe(0);
        });

        it('canEdit is in response', () => {
          expect(event.canEdit).toBeTruthy();
        });

        it('provides the location in a location key', async () => {
          expect(event.location.name).toBe('La boutique');
        });

        it('attendanceMode and onlineAccessLink can be edited at update', () => {
          expect(event.attendanceMode).toBe(2);
          expect(event.onlineAccessLink).toBe('https://openagenda.com');
        });
      });

      describe('persistence', () => {
        it('custom values are updated', async () => {
          const data = await core.services.custom(2).get(event.uid);

          expect(data['thematiques-bordeaux-metropole']).toEqual([3]);
        });

        it('event state in agenda is updated', async () => {
          const { state } = await core.services
            .agendaEvents(17026855)
            .get(19201989);

          expect(state).toBe(0);
        });
      });

      describe('search', () => {
        let result;

        beforeAll(async () => {
          result = await core.agendas(17026855).events.search(
            {
              uid: event.uid,
              state: null,
            },
            {},
            {
              detailed: true,
              access: 'administrator',
            },
          );
        });

        it('indexed document is updated', () => {
          expect(result.events[0]['thematiques-bordeaux-metropole']).toEqual([
            3,
          ]);
        });

        it('indexed member name is account full name when member name is unspecified', async () => {
          expect(result.events[0].member.name).toBe('steve');
        });
      });

      describe('fixes', () => {
        it('location store should not be present in result', () => {
          expect(event.location.store).toBeUndefined();
        });
      });
    });

    describe('draft update', () => {
      let event;

      beforeAll(async () => {
        event = await core.agendas(17026855).events.update(
          83902931,
          {
            title: {
              fr: 'Un brouillon mis à jour',
              en: 'An updated event',
            },
            description: {
              fr: 'Une description',
              en: 'A desc',
            },
            custom_description: 'Meh',
            'categories-agenda-metropolitain': 42,
            'thematiques-bordeaux-metropole': [4],
            draft: true,
          },
          {
            access: 'contributor',
          },
        );
      });

      it('update is still draft', async () => {
        const e = await core.services.events.get({ uid: 83902931 });
        expect(e.draft).toBe(1);
      });

      it('draft is updated', () => {
        expect(event.title.fr).toBe('Un brouillon mis à jour');
      });

      it('custom data is updated', async () => {
        const data = await core.services.custom(2).get(83902931);
        expect(data['thematiques-bordeaux-metropole']).toEqual([4]);
      });

      it('an undrafted event takes the state required by agenda settings', async () => {
        const otherEvent = await core.agendas(17026855).events.update(
          83902932,
          {
            title: {
              fr: 'Un brouillon plus brouillon',
            },
            description: {
              fr: 'Une desc courte',
            },
            locationUid: 123,
            timings: [
              {
                begin: new Date('2019-12-18T14:30:00'),
                end: new Date('2019-12-18T15:30:00'),
              },
            ],
            draft: false,
            'categories-agenda-metropolitain': 42,
          },
          {
            access: 'administrator',
          },
        );

        expect(otherEvent.state).toBe(1);
      });
    });

    describe('extIds', () => {
      let extIdsEvent;
      beforeAll(async () => {
        extIdsEvent = await core.agendas(17026855).events.patch(
          19201989,
          {
            extIds: [{ key: 'test', value: '123' }],
          },
          {
            access: 'internal',
          },
        );
      });
      it('patching extIds add to existing', async () => {
        const event = await core.agendas(17026855).events.patch(
          19201989,
          {
            extIds: [{ key: 'test2', value: '423' }],
          },
          {
            access: 'internal',
          },
        );
        expect(event.extIds).toEqual([
          { key: 'test2', value: '423' },
          { key: 'test', value: '123' },
        ]);
      });

      it('updating extIds replaces existing when mergeExtIds is false', async () => {
        const event = await core.agendas(17026855).events.update(
          19201989,
          {
            ...extIdsEvent,
            extIds: [{ key: 'test3', value: '423' }],
          },
          {
            access: 'internal',
            mergeExtIds: false,
          },
        );
        expect(event.extIds).toEqual([
          {
            key: 'test3',
            value: '423',
          },
        ]);
      });
    });

    describe('patch', () => {
      it('patch on event title does not remove registration value', async () => {
        const registrationValues = [
          { value: 'https://registration.link.com', type: 'link' },
        ];
        expect(
          await core
            .agendas(9491431)
            .events.get(12993375)
            .then(({ registration }) => registration),
        ).toEqual(registrationValues);
        await core
          .agendas(9491431)
          .events.patch(
            12993375,
            { title: { fr: 'Un nouveau titre' } },
            { access: 'internal' },
          );
        expect(
          await core
            .agendas(9491431)
            .events.get(12993375)
            .then(({ registration }) => registration),
        ).toEqual(registrationValues);
      });

      it('custom values are maintained on state patch', async () => {
        expect(
          await core
            .agendas(9491431)
            .events.patch(12993375, { state: 1 }, { access: 'internal' })
            .then((event) => event['types-devenement']),
        ).not.toBeUndefined();

        expect(
          await core
            .agendas(9491431)
            .events.get(12993375)
            .then((event) => event['types-devenement']),
        ).not.toBeUndefined();

        const {
          events: [eventFromSearch],
        } = await core
          .agendas(9491431)
          .events.search(
            { state: null, uid: 12993375 },
            {},
            { access: 'internal' },
          );

        expect(eventFromSearch['types-devenement']).not.toBeUndefined();
      });

      it('invalid event cannot be patched if fix is not part of patch', async () => {
        let error;
        try {
          await core
            .agendas(9491431)
            .events.patch(
              12993376,
              { title: { fr: 'Un nouveau titre' } },
              { access: 'internal' },
            );
        } catch (e) {
          error = e;
        }
        expect(error.name).toBe('BadRequest');
        const validationError = error.info.errors.find(
          ({ field }) => field === 'timings',
        );
        expect(validationError.message).toBe('at least one timing is required');
      });
    });

    describe('patch with returnPayload: true', () => {
      let result;

      beforeAll(async () => {
        result = await core.agendas(17026855).events.patch(
          19201989,
          {
            state: -1,
          },
          {
            access: 'moderator',
            returnPayload: true,
          },
        );
      });

      describe('response', () => {
        it('success bool is provided in response', () => {
          expect(result.success).toBe(true);
        });

        it('updated event is provided in event response key', () => {
          expect(result.event.description.fr).toBe('Une description');
        });

        it('patched data is in event', () => {
          expect(result.event.state).toBe(-1);
        });
      });
    });

    describe('patch one language only', () => {
      let result;
      let titleBefore;

      beforeAll(async () => {
        titleBefore = await core
          .agendas(17026855)
          .events.get(19201989)
          .then((e) => e.title);
        result = await core.agendas(17026855).events.patch(
          19201989,
          {
            title: { fr: 'Le français est modifié' },
          },
          {
            access: 'moderator',
          },
        );
      });

      it('translates one language', () => {
        expect(result.title.fr).toBe('Le français est modifié');
        expect(result.title.en).toBe(titleBefore.en);
      });
    });

    describe('patch one language only with languages field', () => {
      let result;

      beforeAll(async () => {
        result = await core.agendas(17026855).events.patch(
          19201989,
          {
            title: { fr: 'Le français est modifié' },
            languages: ['fr'],
          },
          {
            access: 'moderator',
          },
        );
      });

      it('translates one language', () => {
        expect(result.title.fr).toBe('Le français est modifié');
        expect(result.title.en).toBeUndefined();
      });
    });

    describe('patch error', () => {
      it('not found event', async () => {
        let err;

        try {
          await core.agendas(89904399).events.patch(
            3,
            {
              title: { fr: 'Patché' },
            },
            {
              userUid: 10866730,
            },
          );
        } catch (error) {
          err = error;
        }

        expect(err.message).toBe('Not found');
      });

      it('ghost event is removed from index at patch attempt', async () => {
        await core.services.agendaEvents(89904399).remove(9876543);
        // event is ghost now.
        const { total: totalBeforePatch } = await core
          .agendas(89904399)
          .events.search({ uid: 9876543 });

        expect(totalBeforePatch).toBe(1);

        try {
          await core
            .agendas(89904399)
            .events.patch(9876543, { title: { fr: 'Patch' } });
        } catch (e) {
          /**/
        }

        const { total: totalAfterPatch } = await core
          .agendas(89904399)
          .events.search({ uid: 9876543 });

        expect(totalAfterPatch).toBe(0);
      });
    });

    describe('other', () => {
      it('if state is not specified in provided data, state is not updated', async () => {
        const { state: currentState } = await core.services
          .agendaEvents(17026855)
          .get(19201989);

        await core.agendas(17026855).events.update(
          19201989,
          {
            featured: true,
            title: {
              fr: 'Un événement remis à jour',
              en: 'An updated event',
            },
            description: {
              fr: 'Une description',
              en: 'A desc',
            },
            location: {
              uid: 123,
            },
            timings: [
              {
                begin: new Date('2019-05-06T10:00:00'),
                end: new Date('2019-05-06T11:00:00'),
              },
              {
                begin: new Date('2019-05-06T12:00:00'),
                end: new Date('2019-05-06T13:00:00'),
              },
            ],
            'categories-agenda-metropolitain': 43,
            'thematiques-bordeaux-metropole': [3],
          },
          {
            access: 'administrator',
          },
        );

        const { state: updatedState } = await core.services
          .agendaEvents(17026855)
          .get(19201989);

        expect(currentState).toBe(updatedState);
      });

      it('event can be updated with timings specifying begin&end as { date, hours, minutes } objects', async () => {
        const event = await core.agendas(17026855).events.patch(
          19201989,
          {
            timings: [
              {
                begin: {
                  date: '2019-12-14',
                  hours: 18,
                  minutes: 28,
                },
                end: {
                  date: '2019-12-14',
                  hours: 18,
                  minutes: 40,
                },
              },
            ],
          },
          { access: 'administrator' },
        );

        expect(new Date(event.timings[0].begin).getUTCHours()).toBe(17);
        expect(new Date(event.timings[0].begin).getMinutes()).toBe(28);
      });

      it('online event location can be removed through patch', async () => {
        const event = await core.agendas(17026855).events.patch(
          19201989,
          {
            attendanceMode: 2,
            onlineAccessLink: 'https://openagenda.com',
            location: null,
          },
          { access: 'administrator' },
        );

        expect(event.locationUid).toBeUndefined();
      });

      it('internal patch does not patch if event is invalid', async () => {
        let errors;
        try {
          await core.agendas(37026800).events.patch(
            88888888,
            {
              location: { uid: 73780602 },
            },
            {
              access: 'internal',
            },
          );
        } catch (e) {
          errors = e.info.errors;
        }

        expect(errors).toStrictEqual([
          {
            origin: undefined,
            code: 'choice.required',
            message: 'a (known) value must be chosen',
            field: 'categories-agenda-metropolitain',
            step: 'validation',
          },
        ]);
      });

      it('internal patch patches if systemValidatePatchDataOnly option is true', async () => {
        const patchedEvent = await core.agendas(37026800).events.patch(
          88888888,
          {
            location: { uid: 73780602 },
          },
          {
            access: 'internal',
            systemValidatePatchDataOnly: true,
          },
        );

        expect(patchedEvent.location.uid).toBe(73780602);
      });
    });
  });

  describe('api', () => {
    let accessToken;

    const ctx = withTestServer(() => api(core, { useRouter: false }));

    beforeAll(async () => {
      const tokenResponse = await ky
        .post(`${ctx.baseUrl}/requestAccessToken`, {
          json: {
            // contributor
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    describe('successful update', () => {
      let response;
      beforeAll(async () => {
        try {
          response = await ky
            .post(`${ctx.baseUrl}/agendas/17026855/events/19201989`, {
              headers: {
                'access-token': accessToken,
              },
              json: {
                state: 0,
                featured: true,
                title: {
                  fr: "Un événement mis à jour via l'api",
                  en: 'An updated event through the api',
                },
                description: {
                  fr: 'Une description',
                  en: 'A desc',
                },
                location: {
                  uid: 123,
                },
                timezone: 'Europe/Paris',
                timings: [
                  {
                    begin: '2025-10-28T20:30:00',
                    end: '2025-10-28T22:20:00',
                  },
                ],
                custom_description: 'Meh',
                'categories-agenda-metropolitain': 43,
                'thematiques-bordeaux-metropole': [3],
              },
            })
            .json();
        } catch (e) {
          // log if needed
        }
      });

      it('response gives success key if update was a success', () => {
        expect(response.success).toBe(true);
      });

      it('updated event is provided in event key', () => {
        expect(response.event.uid).toBe(19201989);
      });

      it('updated event has expected timings', () => {
        expect(new Date(response.event.timings[0].begin)).toEqual(
          new Date('2025-10-28T20:30:00.000+01:00'),
        );
      });
    });

    describe('unsuccessful update', () => {
      let response;
      beforeAll(async () => {
        try {
          await ky
            .post(`${ctx.baseUrl}/agendas/17026855/events/19201989`, {
              headers: {
                'access-token': accessToken,
              },
              json: {
                title: {
                  fr: "Un événement mis à jour via l'api",
                  en: 'An updated event through the api',
                },
                description: {
                  fr: 'Une description',
                  en: 'A desc',
                },
                location: {
                  uid: 123,
                },
                custom_description: 'Meh',
                'categories-agenda-metropolitain': 43,
                'thematiques-bordeaux-metropole': [3],
              },
            })
            .json();
        } catch (e) {
          response = e.response;
        }
      });

      it('response status should be 400', () => {
        expect(response.status).toBe(400);
      });

      it('response body provides validation errors', async () => {
        const errorData = await response.json();
        expect(errorData.errors).toEqual([
          {
            code: 'timings.invalid',
            message: 'Invalid timings',
            field: 'timings',
            step: 'validation',
          },
        ]);
      });
    });

    describe('unsuccessful update - invalid image', () => {
      let response;
      beforeAll(async () => {
        try {
          await ky
            .post(`${ctx.baseUrl}/agendas/17026855/events/19201989`, {
              headers: {
                'access-token': accessToken,
              },
              json: {
                title: {
                  fr: "Un événement mis à jour via l'api",
                  en: 'An updated event through the api',
                },
                description: {
                  fr: 'Une description',
                  en: 'A desc',
                },
                location: {
                  uid: 123,
                },
                custom_description: 'Meh',
                'categories-agenda-metropolitain': 43,
                'thematiques-bordeaux-metropole': [3],
                timings: [
                  {
                    begin: new Date('2019-05-06T10:00:00'),
                    end: new Date('2019-05-06T11:00:00'),
                  },
                  {
                    begin: new Date('2019-05-06T12:00:00'),
                    end: new Date('2019-05-06T13:00:00'),
                  },
                ],
                image: { url: 'https://google.fr' },
              },
            })
            .json();
        } catch (e) {
          response = e.response;
        }
      });

      it('response status should be 400', () => {
        expect(response.status).toBe(400);
      });

      it('response body provides validation errors', async () => {
        const errorData = await response.json();
        expect(errorData.errors).toEqual([
          {
            field: 'image',
            code: 'format.unknown',
            message: 'provided format is unknown',
            fieldLabel: 'Image of the event',
            label: 'The format of the image is unknown',
          },
        ]);
      });
    });

    describe('successful patch', () => {
      let response;
      beforeAll(async () => {
        response = await ky
          .patch(`${ctx.baseUrl}/agendas/17026855/events/19390293`, {
            headers: {
              'access-token': accessToken,
            },
            json: {
              title: {
                fr: "Un événement mis à jour via l'api",
              },
              attendanceMode: 2,
              onlineAccessLink: 'https://openagenda.com',
            },
            throwHttpErrors: false,
          })
          .json();
      });

      it('body contains event', async () => {
        expect(response.event.uid).toBe(19390293);
      });

      it('fix: image is maintained', () => {
        expect(response.event.image.filename).toEqual('fdqfsdq.jpg');
      });

      it('attendanceMode is patched', () => {
        expect(response.event.attendanceMode).toBe(2);
      });
    });

    describe('extIds', () => {
      let response;
      beforeAll(async () => {
        await core.agendas(17026855).events.patch(
          19390293,
          {
            extIds: [{ key: 'test', value: '123' }],
          },
          {
            access: 'internal',
          },
        );
      });

      it('patching extIds add to existing', async () => {
        try {
          response = await ky
            .patch(`${ctx.baseUrl}/agendas/17026855/events/19390293`, {
              headers: {
                'access-token': accessToken,
              },
              json: {
                extIds: [{ key: 'test2', value: '423' }],
              },
            })
            .json();
          expect(response.event.extIds).toEqual([
            { key: 'test2', value: '423' },
            { key: 'test', value: '123' },
          ]);
        } catch (e) {
          // console.log(e);
        }
      });

      it('updating extIds replaces existing when mergeExtIds options is false', async () => {
        response = await ky
          .post(
            `${ctx.baseUrl}/agendas/17026855/events/19390293?mergeExtIds=false`,
            {
              headers: {
                'access-token': accessToken,
              },
              json: {
                state: 0,
                featured: true,
                title: {
                  fr: "Un événement mis à jour via l'api",
                  en: 'An updated event through the api',
                },
                description: {
                  fr: 'Une description',
                  en: 'A desc',
                },
                location: {
                  uid: 123,
                },
                timings: [
                  {
                    begin: new Date('2019-05-06T10:00:00'),
                    end: new Date('2019-05-06T11:00:00'),
                  },
                  {
                    begin: new Date('2019-05-06T12:00:00'),
                    end: new Date('2019-05-06T13:00:00'),
                  },
                ],
                custom_description: 'Meh',
                'categories-agenda-metropolitain': 43,
                'thematiques-bordeaux-metropole': [3],
                extIds: [{ key: 'test3', value: '423' }],
              },
            },
          )
          .json();
        expect(response.event.extIds).toEqual([{ key: 'test3', value: '423' }]);
      });
    });

    describe('monolingual patch', () => {
      it('monolingual patch is by default english', async () => {
        const patchResponse = await ky
          .patch(`${ctx.baseUrl}/agendas/17026855/events/19201989`, {
            headers: {
              'access-token': accessToken,
            },
            json: {
              title: 'Un événement remis à jour',
            },
          })
          .json();

        expect(patchResponse.event.title.en).toEqual(
          'Un événement remis à jour',
        );
      });

      it('monolingual patch is in language specified in header', async () => {
        const patchLangInHeaderResponse = await ky
          .patch(`${ctx.baseUrl}/agendas/17026855/events/19201989`, {
            headers: {
              'access-token': accessToken,
              lang: 'fr',
            },
            json: {
              title: 'Un événement reremis à jour',
            },
          })
          .json();

        expect(patchLangInHeaderResponse.event.title.fr).toEqual(
          'Un événement reremis à jour',
        );
      });
    });
  });
});
