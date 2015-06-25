"use strict";

var log = require( '../../../lib/logger' )( 'EmailStrategie' ),

emailStrat = require( 'emailStrategie' ),

storeKey = 'emailstrategie';

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  return {
    emailStrategie: {
      getAccount: getAccount,
      removeAccount: removeAccount,
      getAccountList: getAccountList,
      setAccountList: setAccountList,
      setAccount: setAccount,
      syncEvents: syncEvents,
      setEvent: setEvent,
      removeEvent: removeEvent
    }
  };

  function getAccount( cb ) {

    _getStore( function( err, id ) {

      if ( id ) return emailStrat.getAccount( id, cb );

      cb( null, false );

    });

  }

  function removeAccount( cb ) {

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

            cb( null, {
              account: account,
              list: list 
            } );

          } );
          
        } );

      } else {

        account.getList( function( err, list ) {

          if ( err ) return cb( err );

          cb( null, { account: account, list: list } );

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

      instance.flattener( false, function( err, f ) {

        cb( err, list, f );

      } );

    } );

  }

  function syncEvents( cb ) {

    _getList( function( err, list ) {

      if ( err ) return cb( err );

      // no callback is given -> queued on redis
      list.clear();

      instance.flattener( false, function( err, f ) {

        instance.searchStream( { passed: 1 }, function( err, stream ) {

          stream.on( 'data', function( eventItem ) {

            // no callback is given -> queued on redis
            list.setItem( eventItem.uid, f.flatten( eventItem ) );

          } );

          stream.on( 'end', cb );

        });

      } );

    });

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

        if ( list ) return cb( null, list );

        instance.flattener( false, function( err, f ) {

          account.createList( f.getFieldNames(), cb );

        } );

      } );

    } );

  }



  function _getStore( cb ) {

    instance.getStore( storeKey, false, cb );

  }

  function _setStore( id, cb ) {

    instance.setStore( storeKey, id, true, cb );

  }

} );