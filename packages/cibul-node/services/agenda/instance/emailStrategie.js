"use strict";

var log = require( '../../../lib/logger' )( 'EmailStrategie' ),

emailStrat = require( 'emailStrategie' ),

eventSvc = require( '../../event' ),

w = require( 'when' ),

utils = require( 'utils' ),

storeKey = 'emailstrategie',

searchDefaultQuery = { passed: 1 };

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  return {
    emailStrategie: {
      getState: getState,
      isLinked: isLinked,
      getAccount: getAccount,
      removeAccount: removeAccount,
      getAccountList: getAccountList,
      setAccountList: setAccountList,
      setAccount: setAccount,
      syncEvents: syncEvents,
      pushEvents: pushEvents,
      setEvent: setEvent,
      removeEvent: removeEvent
    }
  }


  /**
   * load general link info
   */

  function getState( cb ) {

    w( {
      account: false,
      list: false,
      fields: [],
      emailStrategieCount: 0,
      agendaCount: 0,
      error: false,
      state: false
    } )

    // get account & list
    .then( function( obj ) {

      return w.promise( function( rs, rj ) {

        getAccountList( function( err, o ) {

          if ( err ) return rj( err );

          utils.extend( obj, o );

          if ( !obj || !obj.account ) {

            cb( null, obj );

          } else {

            obj.state = obj.list ? obj.list.state : false;

            rs( obj );

          }

        });

      })

    })

    // load email strategie list count
    .then( function( obj ) {

      obj.emailStrategieCount = false;

      if ( !obj.list ) return obj;

      return w.promise( function( rs, rj ) {

        obj.list.getCount( function( err, count ) {

          if ( err ) return rj( err );

          obj.emailStrategieCount = count;

          rs( obj );            

        });

      } );

    })

    // get fields in state
    .then( function( obj ) {

      return w.promise( function( rs, rj ) {

        loaded.flattener( false, function( err, f ) {

          if ( err ) return rj( err );

          var listFields = obj.list ? obj.list.getFields() : [];

          obj.fields = f.getFieldNames().map( function( fName ) {

            return {
              name: fName,
              checked: listFields.indexOf( fName ) !== -1
            }

          } ). filter( function( f ) {

            return f.name !== 'uid';

          });

          rs( obj );

        } );

      });

    } )

    .done( function( obj ) {

      cb( null, obj );

    }, cb );

  }

  function getAccount( cb ) {

    _getStore( function( err, id ) {

      if ( id ) return emailStrat.getAccount( id, cb );

      cb( null, false );

    });

  }

  function removeAccount( cb ) {

    log( 'removing account for agenda %s', loaded.slug );

    getAccount( function( err, account ) {

      if ( err ) return cb( err );

      account.unlink( function( err ) {

        if ( err ) return cb( err );

        _setStore( false, cb );

      });

    });

  }

  function getAccountList( cb ) {

    _getStore( function( err, id ) {

      if ( id ) return emailStrat.getAccountList( id, cb );

      cb( null, false );

    });

  }

  function setAccount( login, password, cb ) {

    getAccount( function( err, account ) {

      if ( err ) return cb( err );

      var reset = false;

      if ( account && account.login !== login ) {

        return _resetAccount( login, password, cb );

      } else if ( !account ) {

        return _linkAccount( login, password, cb );

      } else {

        account.update( { password: password }, cb );

      }

    });

  }

  function setAccountList( login, password, cb ) {

    setAccount( login, password, function( err, account ) {

      if ( err ) return cb( err );

      if ( !account.lists.length ) {

        loaded.flattener( false, function( err, f ) {

          if ( err ) return cb( err );

          account.createList( instance.getTitle(), f.getFieldNames(), function( err, list ) {

            if ( err ) return cb( err );

            list.setState( 'sending', function( err ) {

              syncEvents( false, function( err, syncCount ) {

                cb( null, {
                  account: account,
                  list: list,
                  syncCount: syncCount
                } );

              });

            });

          } );
          
        } );

      } else {

        account.getList( function( err, list ) {

          if ( err ) return cb( err );

          cb( null, {
            account: account,
            list: list
          } );

        });

      }

    } );

  }

  function setEvent( event, cb ) {

    _prepare( function( err, list ) {

      if ( err ) return cb( err );

      list.setItem( event.uid, f.flatten( event ) );

      cb();

    } );

  }

  function removeEvent( event, cb ) {

    _prepare( function( err, list ) {

      if ( err ) return cb( err );

      list.removeItem( event.uid );

    });

  }

  function _prepare( cb ) {

    _getList( function( err, list ) {

      if ( err ) return cb( err );

      loaded.flattener( false, function( err, f ) {

        cb( err, list, f );

      } );

    } );

  }

  function pushEvents( fields, cb ) {

    fields.splice( 0, 0, 'uid' );

    _getList( function( err, list, account ) {

      if ( err ) return cb( err );

      if ( !list ) {

        account.createList( instance.getTitle(), fields, function( err, list ) {

          if ( err ) return cb( err );

          list.setState( 'sending', function( err ) {

            _streamEvents( 'sending', list, cb );

          } );

        } );

      } else {

        list.clear( fields, function( err ) {

          if ( err ) return cb( err );

          _streamEvents( 'sending', list, cb );

        });

      }

    } );

  }

  function syncEvents( clear, cb ) {

    log( 'info', 'received event sync request for agenda %s', loaded.uid );

    _getList( function( err, list ) {

      if ( err ) return cb( err );

      if ( clear ) {

        log( 'debug', 'sync request - %s - queuing clear', loaded.uid );

        list.clear( 'sending', function( err ) {

          if ( err ) return cb( err );

          _streamEvents( list, cb );

        });

      } else {

        _streamEvents( 'sending', list, cb );

      }

    });

  }

  function _streamEvents( newState, list, cb ) {

    if ( arguments.length == 2 ) {

      cb = list;

      list = newState;

      newState = list.state;

    }

    list.setState( newState, function( err ) {

      if ( err ) return cb( err );

      loaded.flattener( false, function( err, f ) {

        var stream = loaded.searchStream( searchDefaultQuery ),

        count = 0;

        log( 'info', 'sync request - %s - loaded event stream', loaded.uid );

        stream.on( 'data', function( eventItem ) {

          var eInst = eventSvc.instanciate( eventItem );

          stream.pause();

          eventSvc.exports.clean( eInst, function( err, clean ) {

            log( 'debug', 'sync request - %s - queueing event %s for list %s', loaded.uid, eventItem.uid, list.id );

            list.setItem( eventItem.uid, f.flatten( clean ) );

            count++;

            stream.resume();

          } );

        } );

        stream.on( 'end', function() {

          log( 'debug', 'sync request - %s - done. processed %s events', loaded.slug, count );

          list.setState( false );

          cb();

        } );

      } );
      
    } );

  }

  function _getAccountAndRemoveList( cb ) {

    getAccount( function( err, account ) {

      if ( err ) return cb( err );

      if ( !account ) return cb( 'link is not set' );

      account.getList( function( err, list ) {

        if ( err ) return cb( err );

        if ( !list ) return cb( null, account );

        list.remove( function( err ) {

          if ( err ) return cb( err );

          cb( null, account );

        } );

      });

    } );

  }


  function _resetAccount( login, password, cb ) {

    _getStore( function( err, id ) {

      if ( err ) return cb( err );

      emailStrat.unlinkAccount( id, function( err ) {

        if ( err ) return cb( err );

        _setStore( false, function( err ) {

          if ( err ) return cb( err );

          _linkAccount( login, password, cb );

        });

      });

    });

  }

  function _linkAccount( login, password, cb ) {

    emailStrat.linkAccount( login, password, function( err, account ) {

      if ( err || !account ) return cb( err, account );

      _setStore( account.id, function( err ) {

        if ( err ) return cb( err );

        cb( null, account );

      } );

    });

  }

  function _getList( cb ) {

    getAccount( function( err, account ) {

      if ( err ) return cb( err );

      if ( !account ) return cb( 'link is not set' );

      account.getList( function( err, list ) {

        if ( err ) return cb( err );

        cb( null, list, account );

      } );

    } );

  }


  function isLinked( cb ) {

    _getStore( function( err, id ) {

      if ( err ) return cb( err );

      cb( null, id );

    });

  }


  function _getStore( cb ) {

    instance.getStore( storeKey, false, cb );

  }

  function _setStore( id, cb ) {

    instance.setStore( storeKey, id, true, cb );

  }

} );