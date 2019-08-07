"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const VError = require( 'verror' );
const queue = require( '@openagenda/queue' );
const Service = require( './service' );
const config = require( '../testconfig' );

let q;
let service;

describe( 'activities - notifications', function () {

  this.timeout( 30000 );


  describe( 'get', () => {

    before( async () => {

      service = await Service.initAndLoad( config );

    } );

    after( () => service.shutdown );

    it( 'get a notification with a bad query', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications.get( { verb: {} } )
        .should.rejectedWith( VError, {
          jse_shortmsg: 'Query validation failed',
          jse_info: {
            errors: [ {
              field: 'verb',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {}
            } ]
          },
          message: 'Query validation failed'
        } );

    } );

    it( 'get a notification', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .get( { verb: 'event.create', groupBy: 'target:agenda:48648352' } )
        .then( notif => {

          notif.createdAt.should.Date();
          notif.updatedAt.should.Date();
          return _.omit( notif, 'createdAt', 'updatedAt' );

        } )
        .should.fulfilledWith( {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actors: [ 'user:45645612' ],
            objects: [ 'event:98798765' ],
            targets: [ 'agenda:48648352' ],
            labels: {
              actor: 'Sonny',
              object: 'Réunion des junkies anonymes',
              target: 'Apéro du matin'
            }
          },
          state: 0,
          sent: 0
        } );

    } );

    it( 'get a notification that doesn\'t exist', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .get( { verb: 'event.create', groupBy: 'target:agenda:48648352', state: 2 } )
        .should.fulfilledWith();

    } );

    it( 'get a notification of a feed that doesn\'t exists', () => {

      return service.feed( { entityType: 'user', entityUid: 84 } ).notifications
        .get( { verb: 'event.create', groupBy: 'target:agenda:48648352' } )
        .should.rejectedWith( VError, {
          jse_shortmsg: 'Feed not found',
          jse_info: {},
          message: 'Feed not found'
        } );

    } );

    it( 'get a notification of a feed that isn\'t a user feed', () => {

      return service.feed( { entityType: 'agenda', entityUid: 84 } ).notifications
        .get( { verb: 'event.create', groupBy: 'target:agenda:48648352' } )
        .should.rejectedWith( VError, {
          jse_shortmsg: 'The notifications concern only feeds users',
          jse_info: {},
          message: 'The notifications concern only feeds users'
        } );

    } );

  } );

  describe( 'addActivity', () => {

    before( () => {

      q = queue( config.queue.names.addActivity, { redis: config.queue.redis } );

    } );

    beforeEach( done => {

      q.test.clear( config.queue.names.addActivity, err => {

        done();

      } );

    } );

    beforeEach( async () => {

      service = await Service.initAndLoad( config );

    } );

    it( 'add an activity to a new notification', () => {

      return service.tasks.notifications.addActivity( { entityType: 'user', entityUid: 42 }, {
        actor: 'user:12312312',
        verb: 'event.create',
        object: 'event:78978978',
        target: 'agenda:66666666',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette'
          }
        }
      } ).then( notif => {

        notif.createdAt.should.Date();
        notif.updatedAt.should.Date();
        return _.omit( notif, 'createdAt', 'updatedAt' );

      } )
        .should.fulfilledWith( {
          id: 6,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:66666666',
          store: {
            actors: [ 'user:12312312' ],
            objects: [ 'event:78978978' ],
            targets: [ 'agenda:66666666' ],
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette'
            }
          },
          state: 0,
          sent: 0
        } );

    } );

    it( 'add an activity grouped by a property in store to a new notification', () => {

      return service.tasks.notifications.addActivity( { entityType: 'user', entityUid: 42 }, {
        actor: 'user:12312312',
        verb: 'agenda.changeEventState',
        object: 'event:78978978',
        target: 'agenda:66666667',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette'
          },
          newState: 2
        }
      } )
        .then( notif => {

          notif.createdAt.should.Date();
          notif.updatedAt.should.Date();
          return _.omit( notif, 'createdAt', 'updatedAt' );

        } )
        .should.fulfilledWith( {
          id: 6,
          feedId: 2,
          verb: 'agenda.changeEventState',
          groupBy: 'target:agenda:66666667|store.newState:2',
          store: {
            actors: [ 'user:12312312' ],
            objects: [ 'event:78978978' ],
            targets: [ 'agenda:66666667' ],
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette'
            },
            newState: 2
          },
          state: 0,
          sent: 0
        } );

    } );

    it( 'add an activity grouped by a property in store to an existant notification', () => {

      return service.tasks.notifications.addActivity( { entityType: 'user', entityUid: 42 }, {
        actor: 'user:12312315',
        verb: 'agenda.changeEventState',
        object: 'event:78978978',
        target: 'agenda:66666666',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette'
          },
          newState: 2
        }
      } )
        .then( notif => {

          notif.createdAt.should.Date();
          notif.updatedAt.should.Date();
          return _.omit( notif, 'createdAt', 'updatedAt' );

        } )
        .should.fulfilledWith( {
          id: 5,
          feedId: 2,
          verb: 'agenda.changeEventState',
          groupBy: 'target:agenda:66666666|store.newState:2',
          store: {
            actors: [ 'user:12312312', 'user:12312315' ],
            objects: [ 'event:78978999', 'event:78978978' ],
            targets: [ 'agenda:66666666' ],
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette'
            },
            newState: 2
          },
          state: 0,
          sent: 0
        } );

    } );

    it( 'add an activity to an existant notification', () => {

      return service.tasks.notifications.addActivity( { entityType: 'user', entityUid: 42 }, {
        actor: 'user:86868686',
        verb: 'event.create',
        object: 'event:12312345',
        target: 'agenda:48648352',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette'
          }
        }
      } )
        .then( notif => {

          notif.createdAt.should.Date();
          notif.updatedAt.should.Date();
          return _.omit( notif, 'createdAt', 'updatedAt' );

        } )
        .should.fulfilledWith( {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actors: [ 'user:45645612', 'user:86868686' ],
            objects: [ 'event:98798765', 'event:12312345' ],
            targets: [ 'agenda:48648352' ],
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette'
            }
          },
          state: 0,
          sent: 0
        } );

    } );

    it( 'add an activity to an inexistant feed', () => {

      return service.tasks.notifications.addActivity( { entityType: 'user', entityUid: 86 }, {
        actor: 'user:86868686',
        verb: 'event.create',
        object: 'event:12312345',
        target: 'agenda:48648352',
        store: {
          labels: {
            actor: 'Jacky',
            object: 'Réunion des junkies anonymes 2',
            target: 'La fumette'
          }
        }
      } )
        .should.rejectedWith( VError, {
          jse_shortmsg: 'Feed not found',
          jse_info: {},
          message: 'Feed not found'
        } );

    } );

    it( 'add an activity to an agenda feed', () => {

      return service.tasks.notifications.addActivity( { entityType: 'agenda', entityUid: 86 }, {
        actor: 'user:86868686',
        verb: 'agenda.create',
        target: 'agenda:48648352',
        store: {
          labels: {
            actor: 'Jacky',
            target: 'La fumette'
          }
        }
      } )
        .should.rejectedWith( VError, {
          jse_shortmsg: 'The notifications concern only feeds users',
          jse_info: {},
          message: 'The notifications concern only feeds users'
        } );

    } );

    it( 'queued creates are processed by .task', done => {

      service.tasks.notifications.addActivity.task( ( err, notif ) => {

        should( err ).equal( null );

        notif.createdAt.should.Date();
        notif.updatedAt.should.Date();
        notif = _.omit( notif, 'createdAt', 'updatedAt' );

        notif.should.eql( {
          id: 6,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:66666666',
          store: {
            actors: [ 'user:12312312' ],
            objects: [ 'event:78978978' ],
            targets: [ 'agenda:66666666' ],
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette'
            }
          },
          state: 0,
          sent: 0
        } );

        done();

      } );

      service.feed( { entityType: 'user', entityUid: 42 } ).notifications.addActivity( {
        actor: 'user:12312312',
        verb: 'event.create',
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

  describe( 'count', () => {

    before( async () => {

      service = await Service.initAndLoad( config );

    } );

    after( () => service.shutdown );

    it( 'count notifications of a user feed', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications.count()
        .should.fulfilledWith( 4 );

    } );

    it( 'count read notifications of a user feed', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications.count( { state: 1 } )
        .should.fulfilledWith( 0 );

    } );

    it( 'count notifications of an inexistant feed', () => {

      return service.feed( { entityType: 'user', entityUid: 85 } ).notifications.count()
        .should.rejectedWith( VError, {
          jse_shortmsg: 'Feed not found',
          jse_info: {},
          message: 'Feed not found'
        } );

    } );

  } );

  describe( 'markAs', () => {

    beforeEach( async () => {

      service = await Service.initAndLoad( config );

    } );

    after( () => service.shutdown );

    it( 'mark a notification as read', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .markAs( { verb: 'event.create', groupBy: 'target:agenda:48648352' }, 2 )
        .then( ( [ notif ] ) => {

          notif.createdAt.should.Date();
          notif.updatedAt.should.Date();
          return _.omit( notif, 'createdAt', 'updatedAt' );

        } )
        .should.fulfilledWith( {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actors: [ 'user:45645612' ],
            objects: [ 'event:98798765' ],
            targets: [ 'agenda:48648352' ],
            labels: {
              actor: 'Sonny',
              object: 'Réunion des junkies anonymes',
              target: 'Apéro du matin'
            }
          },
          state: 2,
          sent: 0
        } );

    } );

    it( 'mark some notifications of a feed as read', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .markAs( { verb: 'event.create' }, 2 )
        .then( ( notifs ) => {

          return notifs.map( notif => {

            notif.createdAt.should.Date();
            notif.updatedAt.should.Date();
            return _.omit( notif, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [ {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 2,
          sent: 0
        }, {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actors: [ 'user:45645612' ],
            objects: [ 'event:98798765' ],
            targets: [ 'agenda:48648352' ],
            labels: {
              actor: 'Sonny',
              object: 'Réunion des junkies anonymes',
              target: 'Apéro du matin'
            }
          },
          state: 2,
          sent: 0
        } ] );

    } );

    it( 'mark some notifications with ids as seen', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .markAs( { ids: [ 2, 3 ] }, 1 )
        .then( ( notifs ) => {

          return notifs.map( notif => {

            notif.createdAt.should.Date();
            notif.updatedAt.should.Date();
            return _.omit( notif, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [ {
          id: 3,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 1,
          sent: 0
        }, {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 1,
          sent: 0
        } ] );

    } );

    it( 'mark some notifications with ids as seen - with allowRegress option to false', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .markAs( { ids: [ 2, 3 ] }, 1, { allowRegress: false } )
        .then( ( notifs ) => {

          return notifs.map( notif => {

            notif.createdAt.should.Date();
            notif.updatedAt.should.Date();
            return _.omit( notif, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [ {
          id: 3,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 1,
          sent: 0
        }, {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 2,
          sent: 0
        } ] );

    } );

    it( 'mark a notification as read with state in string', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .markAs( { verb: 'event.create', groupBy: 'target:agenda:48648352' }, 'seen' )
        .then( ( [ notif ] ) => {

          notif.createdAt.should.Date();
          notif.updatedAt.should.Date();
          return _.omit( notif, 'createdAt', 'updatedAt' );

        } )
        .should.fulfilledWith( {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actors: [ 'user:45645612' ],
            objects: [ 'event:98798765' ],
            targets: [ 'agenda:48648352' ],
            labels: {
              actor: 'Sonny',
              object: 'Réunion des junkies anonymes',
              target: 'Apéro du matin'
            }
          },
          state: 1,
          sent: 0
        } );

    } );

    it( 'try to mark a notification that doesn\'t exist', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .markAs( { verb: 'event.create', groupBy: 'target:agenda:96385274' }, 'seen' )
        .should.fulfilledWith( [] );

    } );

    it( 'try to mark a notification with a bad query', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .markAs( { verb: {}, groupBy: 'target:agenda:96385274' }, 'seen' )
        .should.rejectedWith( VError, {
          jse_shortmsg: 'Query validation failed',
          jse_info: {
            errors: [ {
              field: 'verb',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {}
            } ]
          },
          message: 'Query validation failed'
        } );

    } );

  } );

  describe( 'list', () => {

    beforeEach( async () => {

      service = await Service.initAndLoad( config );

    } );

    after( () => service.shutdown );

    it( 'simple list of notifications of a feed', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .list()
        .then( notifs => {

          return notifs.map( notif => {

            notif.createdAt.should.Date();
            notif.updatedAt.should.Date();
            return _.omit( notif, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [ {
          id: 5,
          feedId: 2,
          verb: 'agenda.changeEventState',
          groupBy: 'target:agenda:66666666|store.newState:2',
          store: {
            actors: [ 'user:12312312' ],
            objects: [ 'event:78978999' ],
            targets: [ 'agenda:66666666' ],
            labels: {
              actor: 'Jacky',
              object: 'Réunion des junkies anonymes 2',
              target: 'La fumette'
            },
            newState: 2
          },
          state: 0,
          sent: 0
        }, {
          id: 4,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648354',
          store: {
            actors: [ 'user:45645614' ],
            objects: [ 'event:99798766' ],
            targets: [ 'agenda:58648353' ],
            labels: {
              actor: 'Kaore',
              object: 'Visite d\'OpenAgenda v2',
              target: 'Visites chez les géants du web 2017'
            }
          },
          state: 0,
          sent: 0
        }, {
          id: 3,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 0,
          sent: 0
        }, {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 2,
          sent: 0
        }, {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actors: [ 'user:45645612' ],
            objects: [ 'event:98798765' ],
            targets: [ 'agenda:48648352' ],
            labels: {
              actor: 'Sonny',
              object: 'Réunion des junkies anonymes',
              target: 'Apéro du matin'
            }
          },
          state: 0,
          sent: 0
        } ] );

    } );

    it( 'list with a fromId and a limit', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .list( /* from id */ 4, 2 )
        .then( notifs => {

          return notifs.map( notif => {

            notif.createdAt.should.Date();
            notif.updatedAt.should.Date();
            return _.omit( notif, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [ {
          id: 3,
          feedId: 2,
          verb: 'event.update',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 0,
          sent: 0
        }, {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 2,
          sent: 0
        } ] );

    } );

    it( 'list with a verb in query', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .list( { verb: 'event.create' } )
        .then( notifs => {

          return notifs.map( notif => {

            notif.createdAt.should.Date();
            notif.updatedAt.should.Date();
            return _.omit( notif, 'createdAt', 'updatedAt' );

          } );

        } )
        .should.fulfilledWith( [ {
          id: 2,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648353',
          store: {
            actors: [ 'user:45645613' ],
            objects: [ 'event:99798765' ],
            targets: [ 'agenda:58648352' ],
            labels: {
              actor: 'JP',
              object: 'Visite d\'OpenAgenda',
              target: 'Visites chez les géants'
            }
          },
          state: 2,
          sent: 0
        }, {
          id: 1,
          feedId: 2,
          verb: 'event.create',
          groupBy: 'target:agenda:48648352',
          store: {
            actors: [ 'user:45645612' ],
            objects: [ 'event:98798765' ],
            targets: [ 'agenda:48648352' ],
            labels: {
              actor: 'Sonny',
              object: 'Réunion des junkies anonymes',
              target: 'Apéro du matin'
            }
          },
          state: 0,
          sent: 0
        } ] );

    } );

  } );

  describe( 'remove', () => {

    beforeEach( async () => {

      service = await Service.initAndLoad( config );

    } );

    after( () => service.shutdown );

    it( 'remove a notification', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .remove( { verb: 'event.create', groupBy: 'target:agenda:48648352' } )
        .should.fulfilledWith( 1 );

    } );

    it( 'remove some notifications of a feed', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .remove( { verb: 'event.create' } )
        .should.fulfilledWith( 2 );

    } );

    it( 'remove some notifications with ids', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .remove( { ids: [ 2, 3 ] } )
        .should.fulfilledWith( 2 );

    } );

    it( 'try to remove a notification that doesn\'t exist', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .remove( { verb: 'event.create', groupBy: 'target:agenda:96385274' } )
        .should.fulfilledWith( 0 );

    } );

    it( 'try to remove a notification with a bad query', () => {

      return service.feed( { entityType: 'user', entityUid: 42 } ).notifications
        .remove( { verb: {}, groupBy: 'target:agenda:96385274' } )
        .should.rejectedWith( VError, {
          jse_shortmsg: 'Query validation failed',
          jse_info: {
            errors: [ {
              field: 'verb',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {}
            } ]
          },
          message: 'Query validation failed'
        } );

    } );

  } );

} );
