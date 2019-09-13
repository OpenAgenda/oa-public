"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const knexLib = require( 'knex' );
const Service = require( './service' );
const config = require( '../testconfig' );

describe( 'activities - activities', function () {

  this.timeout( 60000 );

  let service;
  let knex;

  before( async () => {

    knex = knexLib( {
      client: 'mysql',
      connection: config.mysql
    } );

    service = await Service.initAndLoad( config );

  } );

  after( async () => {
    await knex.destroy();
    await service.shutdown();
  } );

  describe( 'list', () => {

    it( 'simple list of activities of a feed', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).activities.list()
        .then( activities => {

          return activities.map( activity => {

            activity.createdAt.should.Date();
            return _.omit( activity, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [
          {
            id: 7,
            actor: 'user:99999954',
            verb: 'event.delete',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
                target: 'la-gargouille'
              }
            }
          }
        ] );

    } );

    it( 'list of activities with an offset and a limit', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).activities.list( 4, 3 )
        .then( activities => {

          return activities.map( activity => {

            activity.createdAt.should.Date();
            return _.omit( activity, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [
          {
            id: 3,
            actor: 'user:99999950',
            verb: 'event.action',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
                target: 'la-gargouille'
              }
            }
          }
        ] );

    } );

    it( 'list with a query', () => {

      return service.activities.list( { verb: 'event.action', object: 'event:54548512' } )
        .then( activities => {

          return activities.map( activity => {

            activity.createdAt.should.Date();
            return _.omit( activity, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [
          {
            id: 5,
            actor: 'user:99999952',
            verb: 'event.action',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
                target: 'la-gargouille'
              }
            }
          }
        ] );

    } );

    it( 'list that doesn\'t associated to a feed', () => {

      return service.activities.list()
        .then( activities => {

          return activities.map( activity => {

            activity.createdAt.should.Date();
            return _.omit( activity, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [
          {
            id: 7,
            actor: 'user:99999954',
            verb: 'event.delete',
            object: 'event:54548512',
            target: 'agenda:48648352',
            store: {
              labels: {
                actor: 'Jacky',
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
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
                object: 'Réunion des junkies anonyme',
                target: 'la-gargouille'
              }
            }
          }
        ] );

    } );

  } );

  describe( 'add', () => {

    it( 'add an activity', () => {

      return service.feed( { entityType: 'user', entityUid: 46 } ).activities.add( {
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

          activity.createdAt.should.Date();
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .then( activity => {

          return knex( config.schemas.feed_activity ).select().where( { activity_id: activity.id } )
            .then( rows => {

              rows.map( v => v.feed_id ).should.eql( [ 6, 4, 7, 8, 9, 10 ] );

              return activity;

            } );

        } )
        .should.fulfilledWith( {
          id: 8,
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

    } );

    it( 'add an activity in a feed that doesn\'t exist', () => {

      return service.feed( { entityType: 'user', entityUid: 75 } ).activities.add( {
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
        .should.rejectedWith(
          Error,
          { message: 'One or more feeds doesn\'t exist in feeds [ { entityType: \'user\', entityUid: 75 } ]' }
        );

    } );

    it( 'add an activity - without following', () => {

      return service.feed( { entityType: 'user', entityUid: 45 } ).activities.add( {
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

          activity.createdAt.should.Date();
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .then( activity => {

          return knex( config.schemas.feed_activity ).select().where( { activity_id: activity.id } )
            .then( rows => {

              rows.map( v => v.feed_id ).should.eql( [ 5 ] );

              return _.omit( activity, 'id' );

            } );

        } )
        .should.fulfilledWith( {
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

    } );

    it( 'add an activity to multiple feeds', () => {

      return service.activities.add( {
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

          activity.createdAt.should.Date();
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .then( activity => {

          return knex( config.schemas.feed_activity ).select().where( { activity_id: activity.id } )
            .then( rows => {

              rows.map( v => v.feed_id ).should.eql( [ 6, 5, 4, 7, 8, 9, 10 ] );

              return _.omit( activity, 'id' );

            } );

        } )
        .should.fulfilledWith( {
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

    } );

    it( 'add an activity that passes through the followFilters', async () => {

      await service.shutdown();

      service = await Service( Object.assign( {}, config, {
        filterFollows: [ {
          verb: 'event.publish',
          getFeeds: true,
          filter: ( activity, originFeed, targetFeed, follow, cb ) => {
            cb( null, true );
          }
        }, {
          verb: 'event.publish',
          getFeeds: true,
          filter: ( activity, originFeed, targetFeed, follow, cb ) => {
            cb( null, targetFeed.id !== 8 );
          }
        } ]
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

          activity.createdAt.should.Date();
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .then( activity => {

          return knex( config.schemas.feed_activity ).select().where( { activity_id: activity.id } )
            .then( rows => {

              rows.map( v => v.feed_id ).should.eql( [ 6, 4, 7 ] );

              return _.omit( activity, 'id' );

            } );

        } )
        .then( activity => {

          activity.should.eql( {
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
          } );

        } );

    } );

  } );

  describe( 'get', () => {

    it( 'get an activity', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).activities.get( 1 )
        .then( activity => {

          activity.createdAt.should.Date();
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .should.fulfilledWith( {
          id: 1,
          actor: 'user:54849455',
          verb: 'event.create',
          object: 'event:54548512',
          target: 'agenda:48648352',
          store: {
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonyme',
              target: 'la-gargouille'
            }
          }
        } );

    } );

    it( 'get an activity that not associated to the feed', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).activities.get( 2 )
        .should.rejectedWith( Error, { message: 'Activity doesn\'t exists' } );

    } );

    it( 'get an activity that not exists', () => {

      return service.activities.get( 172 )
        .should.rejectedWith( Error, { message: 'Activity doesn\'t exists' } );

    } );

    it( 'get an activity regardless of feed', () => {

      return service.activities.get( 2 )
        .then( activity => {

          activity.createdAt.should.Date();
          return _.omit( activity, 'createdAt', 'updatedAt' );

        } )
        .should.fulfilledWith( {
          id: 2,
          actor: 'user:99999999',
          verb: 'event.delete',
          object: 'event:54548512',
          target: 'agenda:48648352',
          store: {
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonyme',
              target: 'la-gargouille'
            }
          }
        } );

    } );

  } );

} );
