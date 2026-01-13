import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('13 - core - functional(server): core.agendas().locations.patch', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '016.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
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
        'keys',
        'accessTokens',
        'tracker',
      ],
    });

    core = Core(services, testConfig);

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(64260763).events.search.rebuild();
    await core.agendas(89904399).events.search.rebuild();

    core.services.agendaLocations.task({ reset: true });
    services.aggregators.task();
    await services.simpleCache.clearAll();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('location is patched', async () => {
    core.agendas(64260763).locations.patch(37923057, {
      name: 'Un étang',
    });

    await new Promise((rs) => {
      core.services.tracker.on(
        'agendaLocations.syncImpactedEventsAndAgendas.done',
        async () => {
          const row = await core.services
            .knex('location')
            .first(['placename'])
            .where('uid', 37923057);
          expect(row.placename).toBe('Un étang');
          rs();
        },
      );
    });
  });

  it('patching with null removes data', async () => {
    const patchedLocation = await core.agendas(64260763).locations.patch(
      37923068,
      {
        extId: null,
      },
      {},
    );

    expect(patchedLocation.extId).toBeNull();
  });

  it('patching with something on legacy key sets default extId', async () => {
    const patchedLocation = await core.agendas(64260763).locations.patch(
      37923068,
      {
        extId: 'some.ext.id',
      },
      {},
    );

    expect(patchedLocation.extId).toBe('some.ext.id');
    expect(patchedLocation.extIds).toEqual([
      {
        key: 'default',
        value: 'some.ext.id',
      },
    ]);
  });

  it('patch of adminLevel', async () => {
    await core.agendas(64260763).locations.patch(37923068, {
      adminLevel6: 'Milieu',
    });

    const row = await core.services
      .knex('location')
      .first('*')
      .where('uid', 37923068);

    expect(row.city_district).toBe('Milieu');
  });

  it('index of agenda where location is patched is refreshed', async () => {
    core
      .agendas(64260763)
      .locations.patch(37923057, {
        address: '13 rue du désespoir, Roubaix',
      })
      .then(() => core.services.tracker('patched'));

    await new Promise((rs, rj) => {
      core.services.tracker.on(
        'agendaLocations.syncImpactedEventsAndAgendas.done',
        async () => {
          const { events } = await core.agendas(64260763).events.search({
            locationUid: 37923057,
          });
          try {
            expect(events[0].location.address).toBe(
              '13 rue du désespoir, Roubaix',
            );
          } catch (e) {
            return rj(e);
          }
          rs();
        },
        true,
      );
    });
  });

  it('indices in other agendas referencing events linked to patched location are refreshed', async () => {
    core.agendas(64260763).locations.patch(37923057, {
      address: "23 rue de l'Espérance, 59100 Roubaix",
    });

    await new Promise((rs, rj) => {
      core.services.tracker.on(
        'agendaLocations.syncImpactedEventsAndAgendas.done',
        async () => {
          const { events } = await core
            .agendas(89904399)
            .events.search({ locationUid: 37923057 });
          try {
            expect(events[0].location.address).toBe(
              "23 rue de l'Espérance, 59100 Roubaix",
            );
          } catch (e) {
            return rj(e);
          }
          rs();
        },
        true,
      );
    });
  });

  it('loadAndProcess is called when event has passCulture registration and location changes', async () => {
    // Mock processApply to prevent external API calls and return a modified registration
    let processApplyCalled = false;
    core.services.registrations.utils.passCulture.processApply = async () => {
      processApplyCalled = true;
      return [
        {
          lastProcessedAt: new Date().toISOString(),
          data: [
            {
              eventDuration: 200,
              bookingContact: 'test@example.com',
              venueId: 548,
              description: 'location update test - PROCESSED',
              category: 'ATELIER_PRATIQUE_ART',
              operation: 'update',
              appliedAt: new Date().toISOString(),
              duo: true,
            },
          ],
          service: 'passCulture',
          type: 'link',
          value: 'https://integration.passculture.app/offre/123299',
        },
      ];
    };

    // Get initial registration state of the test event
    const initialEvent = await core.services.events.get(22258579, {
      access: 'internal',
      detailed: true,
    });
    const initialRegistration = initialEvent.registration;

    core.agendas(64260763).locations.patch(37923057, {
      address: '42 rue de la Test, Roubaix',
      city: 'Roubaix Updated',
    });

    await new Promise((rs, rj) => {
      core.services.tracker.on(
        'agendaLocations.syncImpactedEventsAndAgendas.done',
        async () => {
          try {
            // Verify that processApply was called (indicating loadAndProcess was triggered)
            expect(processApplyCalled).toBe(true);

            // Get updated registration state
            const updatedEvent = await core.services.events.get(22258579, {
              access: 'internal',
              detailed: true,
            });
            const updatedRegistration = updatedEvent.registration;

            // Verify that loadAndProcess was called by checking if registration was processed
            // The registration should have been modified by the loadAndProcess call
            expect(updatedRegistration).not.toEqual(initialRegistration);

            // Verify the passCulture registration exists
            const passCultureReg = updatedRegistration.find(
              (r) => r.service === 'passCulture',
            );
            expect(passCultureReg).toBeDefined();
          } catch (e) {
            return rj(e);
          }
          rs();
        },
        true,
      );
    });
  });

  it('loadAndProcess is not called when event lacks passCulture registration', async () => {
    // Use the existing event without passCulture registration (22258578)
    const initialEvent = await core.services.events.get(22258578, {
      access: 'internal',
      detailed: true,
    });
    const initialRegistration = initialEvent.registration;

    core.agendas(64260763).locations.patch(37923057, {
      address: '99 rue de la Negative Test, Roubaix',
      postalCode: '59100',
    });

    await new Promise((rs, rj) => {
      core.services.tracker.on(
        'agendaLocations.syncImpactedEventsAndAgendas.done',
        async () => {
          try {
            // Get registration state after location patch
            const updatedEvent = await core.services.events.get(22258578, {
              access: 'internal',
              detailed: true,
            });
            const updatedRegistration = updatedEvent.registration;

            // Verify that registration was not modified (loadAndProcess was not called)
            expect(updatedRegistration).toEqual(initialRegistration);

            // Verify no passCulture registration exists
            const passCultureReg = updatedRegistration.find(
              (r) => r.service === 'passCulture',
            );
            expect(passCultureReg).toBeUndefined();
          } catch (e) {
            return rj(e);
          }
          rs();
        },
        true,
      );
    });
  });

  it('patching with too long access string throws validation error', async () => {
    let error;

    try {
      await core.agendas(64260763).locations.patch(37923057, {
        access: 'a'.repeat(5001), // Create a string longer than typical text field limit
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toBe('data is invalid');
    expect(error.info).toBeDefined();
    expect(error.info.errors).toBeDefined();
    expect(error.info.errors[0].code).toBe('string.toolong');
  });
});
