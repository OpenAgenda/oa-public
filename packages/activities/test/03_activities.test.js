"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const Service = require( './service' );
const config = require( '../testconfig' );

describe( 'activities - activities', () => {

  jest.setTimeout( 60000 );

  let service;
  let knex;

  beforeEach(async () => {
    knex = knexLib( {
      client: 'mysql',
      connection: config.mysql
    } );

    service = await Service.initAndLoad( {
      ...config,
      knex,
    } );
  });

  afterEach(async () => {
    await knex.destroy();
    // await service.shutdown();
  });

  describe( 'list', () => {

    it('simple list of activities of a feed', () => {

      return expect(service.feed( { entityType: 'user', entityUid: 42 } ).activities.list()
        .then( activities => {

          return activities.map( activity => {

            expect(activity.createdAt).toBeInstanceOf(Date);
            return _.omit( activity, 'createdAt', 'updatedAt' );

          } );

        } )).resolves.toMatchObject( [
          {
            id: 7,
            actor: 'user:99999954',
            verb: 'event.delete',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 6,
            actor: 'user:99999953',
            verb: 'event.action',
            object: 'event:54548513',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 5,
            actor: 'user:99999952',
            verb: 'event.action',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 4,
            actor: 'user:99999951',
            verb: 'event.delete',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 3,
            verb: 'event.action',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 1,
            actor: 'user:54849455',
            verb: 'event.create',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          }
        ] );

    });

    it('list of activities with an offset and a limit', () => {

      return expect(
        service.feed( { entityType: 'user', entityUid: 42 } ).activities.list( 4, 3 )
          .then( activities => {

            return activities.map( activity => {

              expect(activity.createdAt).toBeInstanceOf(Date);

              return _.omit( activity, 'createdAt', 'updatedAt' );

            } );

          } )
      ).resolves.toMatchObject( [
        {
          id: 3,
          verb: 'event.action',
          object: 'event:54548512',
          target: 'agenda:48648352',
          store: {
            labels: {
              object: 'Réunion des junkies anonymes',
              target: 'la-gargouille'
            }
          }
        },
        {
          id: 1,
          actor: 'user:54849455',
          verb: 'event.create',
          object: 'event:54548512',
          target: 'agenda:48648352',
          store: {
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes',
              target: 'la-gargouille'
            }
          }
        },
      ] );

    });

    it('list with a query', () => {

      return expect(
        service.activities.list( { verb: 'event.action', object: 'event:54548512' } )
          .then( activities => {

            return activities.map( activity => {

              expect(activity.createdAt).toBeInstanceOf(Date);
              return _.omit( activity, 'createdAt', 'updatedAt' );

            } );

          } )
      ).resolves.toMatchObject( [
          {
            id: 5,
            actor: 'user:99999952',
            verb: 'event.action',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 3,
            actor: 'user:99999950',
            verb: 'event.action',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          }
        ] );

    });

    it( 'list that is not associated with a feed', () => {

      return expect(service.activities.list()
        .then( activities => {

          return activities
            .filter(a => a.id < 8) // next activites used for other tests
            .map( activity => {

            expect(activity.createdAt).toBeInstanceOf(Date);
            return _.omit( activity, 'createdAt', 'updatedAt' );

          } );

        } )).resolves.toMatchObject( [
          {
            id: 7,
            actor: 'user:99999954',
            verb: 'event.delete',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 6,
            actor: 'user:99999953',
            verb: 'event.action',
            object: 'event:54548513',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 5,
            actor: 'user:99999952',
            verb: 'event.action',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 4,
            actor: 'user:99999951',
            verb: 'event.delete',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 3,
            actor: 'user:99999950',
            verb: 'event.action',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 2,
            actor: 'user:99999999',
            verb: 'event.delete',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          },
          {
            id: 1,
            actor: 'user:54849455',
            verb: 'event.create',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes',
                target: 'la-gargouille'
              }
            }
          }
        ] );

    });

  } );

  describe( 'add', () => {

    it('add an activity', () => {

      return expect(service.feed( { entityType: 'user', entityUid: 46 } ).activities.add( {
        actor: 'user:78978978',
        verb: 'event.create',
        object: 'event:56488589',
        target: 'agenda:78625845',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette'
          }
        }
      } )
        .then( activity => {

          expect(activity.createdAt).toBeInstanceOf(Date);
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .then( activity => {

          return knex( config.schemas.feed_activity ).select().where( { activity_id: activity.id } )
            .then( rows => {

              expect(rows.map( v => v.feed_id )).toEqual([ 6, 4, 7, 8, 9, 10 ]);

              return activity;

            } );

        } )).resolves.toMatchObject( {
          id: 13,
          actor: 'user:78978978',
          verb: 'event.create',
          object: 'event:56488589',
          target: 'agenda:78625845',
          store: {
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette'
            }
          }
        } );

    });

    it('add an activity with mask', () => {

      return expect(service.feed( { entityType: 'user', entityUid: 46 } ).activities.add( {
        actor: 'user:78978978',
        verb: 'event.withMask',
        object: 'event:56488589',
        target: 'agenda:78625845',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette'
          }
        }
      } )
        .then( activity => {

          expect(activity.createdAt).toBeInstanceOf(Date);
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .then( activity => {

          return knex( config.schemas.feed_activity ).select().where( { activity_id: activity.id } )
            .then( rows => {

              expect(rows.map( v => v.feed_id )).toEqual([ 6, 4, 7, 8, 9, 10 ]);

              return activity;

            } );

        } )).resolves.toMatchObject( {
          id: 13,
          verb: 'event.withMask',
          object: 'event:56488589',
          target: 'agenda:78625845',
          store: {
            labels: {
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette'
            }
          }
        } );

    });

    it('add an activity in a feed that doesn\'t exist', async () => {

      const error = await service.feed({ entityType: 'user', entityUid: 75 }).activities.add({
        actor: 'user:78978978',
        verb: 'event.create',
        object: 'event:56488589',
        target: 'agenda:78625845',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette',
          },
        },
      })
        .then(() => null, e => e);

      return expect(error).toMatchObject({
        message: 'One or more feeds doesn\'t exist',
        info: {
          feeds: [ { entityType: 'user', entityUid: 75 } ]
        }
      });

    });

    it('add an activity - without following', () => {

      return expect(service.feed( { entityType: 'user', entityUid: 45 } ).activities.add( {
        actor: 'user:78978978',
        verb: 'event.create',
        object: 'event:56488589',
        target: 'agenda:78625845',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette'
          }
        }
      } )
        .then( activity => {

          expect(activity.createdAt).toBeInstanceOf(Date);
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .then( activity => {

          return knex( config.schemas.feed_activity ).select().where( { activity_id: activity.id } )
            .then( rows => {

              expect(rows.map( v => v.feed_id )).toEqual([ 5 ]);

              return _.omit( activity, 'id' );

            } );

        } )).resolves.toMatchObject( {
          actor: 'user:78978978',
          verb: 'event.create',
          object: 'event:56488589',
          target: 'agenda:78625845',
          store: {
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette'
            }
          }
        } );

    });

    it('add an activity to multiple feeds', () => {

      return expect(service.activities.add( {
        actor: 'user:66666666',
        verb: 'event.create',
        object: 'event:56488589',
        target: 'agenda:78625845',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes - ep3',
            target: 'Extasy party'
          }
        }
      }, [ { entityType: 'user', entityUid: 46 }, 5 ] )
        .then( activity => {

          expect(activity.createdAt).toBeInstanceOf(Date);
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .then( activity => {

          return knex( config.schemas.feed_activity ).select().where( { activity_id: activity.id } )
            .then( rows => {

              expect(rows.map( v => v.feed_id )).toEqual([ 6, 5, 4, 7, 8, 9, 10 ]);

              return _.omit( activity, 'id' );

            } );

        } )).resolves.toMatchObject( {
          actor: 'user:66666666',
          verb: 'event.create',
          object: 'event:56488589',
          target: 'agenda:78625845',
          store: {
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes - ep3',
              target: 'Extasy party'
            }
          }
        } );

    });

    it('add an activity that passes through the followFilters', async () => {

      service = await Service( Object.assign( {}, config, {
        knex: knexLib( {
          client: 'mysql',
          connection: config.mysql
        } ),
        activities: {
          'event.publish': {
            filterFollows: [
              ({ /* activity, originFeed, targetFeed, follow */ } ) => {
                return true;
              },
              ({ targetFeed } ) => {
                return targetFeed.id !== 8;
              }
            ]
          }
        },
      } ) );

      return service.feed( { entityType: 'user', entityUid: 46 } ).activities.add( {
        actor: 'user:12312312',
        verb: 'event.publish',
        object: 'event:78978978',
        target: 'agenda:66666666',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette'
          }
        }
      } )
        .then( activity => {

          expect(activity.createdAt).toBeInstanceOf(Date);
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .then( activity => {

          return knex( config.schemas.feed_activity ).select().where( { activity_id: activity.id } )
            .then( rows => {

              expect(rows.map( v => v.feed_id )).toEqual([ 6, 4, 7 ]);

              return _.omit( activity, 'id' );

            } );

        } )
        .then( activity => {

          expect(activity).toEqual({
            actor: 'user:12312312',
            verb: 'event.publish',
            object: 'event:78978978',
            target: 'agenda:66666666',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonymes 2',
                target: 'La fumette'
              }
            }
          });

        } );

    });

  } );

  describe( 'get', () => {

    it('get an activity', () => {

      return expect(service.feed( { entityType: 'user', entityUid: 42 } ).activities.get( 1 )
        .then( activity => {

          expect(activity.createdAt).toBeInstanceOf(Date);
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )).resolves.toMatchObject( {
          id: 1,
          actor: 'user:54849455',
          verb: 'event.create',
          object: 'event:54548512',
          target: 'agenda:48648352',
          store: {
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes',
              target: 'la-gargouille'
            }
          }
        } );

    });

    it('get an activity with masked data', () => {

      return expect(service.feed( { entityType: 'user', entityUid: 42 } ).activities.get( 3 )
        .then( activity => {

          expect(activity.createdAt).toBeInstanceOf(Date);
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )).resolves.toMatchObject({
          id: 3,
          verb: 'event.action',
          object: 'event:54548512',
          target: 'agenda:48648352',
          store: {
            labels: {
              object: 'Réunion des junkies anonymes',
              target: 'la-gargouille'
            }
          }
        });

    });

    it('get an activity that not associated to the feed', () => {

      return expect(service.feed({ entityType: 'user', entityUid: 42 }).activities.get(2))
        .rejects.toThrow('Activity doesn\'t exists');

    });

    it('get an activity that not exists', () => {

      return expect(service.activities.get(172))
        .rejects.toThrow('Activity doesn\'t exists');

    });

    it('get an activity regardless of feed', () => {

      return expect(service.activities.get( 2 )
        .then( activity => {

          expect(activity.createdAt).toBeInstanceOf(Date);
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )).resolves.toMatchObject( {
          id: 2,
          actor: 'user:99999999',
          verb: 'event.delete',
          object: 'event:54548512',
          target: 'agenda:48648352',
          store: {
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes',
              target: 'la-gargouille'
            }
          }
        } );

    });

  } );

  describe('anonymize', () => {
    it('no personal information is left after activities have been anonymized using user id', async () => {
      await service.activities.anonymize('user:1234');

      const activitiesWhereUserIsActor = await service.activities.list({
        actor: 'user:1234'
      });

      for (const activity of activitiesWhereUserIsActor) {
        expect(activity.store.labels.actor).toBe('$__deleted');
      }

      const activitiesWhereUserIsTarget = await service.activities.list({
        target: 'user:1234'
      });

      for (const activity of activitiesWhereUserIsTarget) {
        expect(activity.store.labels.target).toBe('$__deleted');
      }
    });

    it('anonymization of email', async () => {
      const activitiesWhereEmailIsObject = await service.activities.list({
        object: 'email:aogendo@oagenda.com'
      });
      const ids = activitiesWhereEmailIsObject.map(a => a.id);

      await service.activities.anonymize('email:aogendo@oagenda.com', { anonymizeMainField: true });

      const activityWhereEmailWasObject = (await service.activities.list({}))
        .filter(a => ids.includes(a.id))
        .pop();

      expect(activityWhereEmailWasObject.store.labels.object).toBe('$__deleted');
      expect(activityWhereEmailWasObject.object).toBe('$__deleted');
    });
  });

});
