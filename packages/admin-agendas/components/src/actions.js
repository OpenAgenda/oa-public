"use strict";

var update = require( 'immutability-helper' );

module.exports = {
  loading( currentState, loading ) {

    var changes = {};

    changes.loading = {
      $set: loading
    };

    return update( currentState, changes );

  },

  setSearch( currentState, query ) {

    return update( currentState, {
      search: {
        query: {
          $set: query
        }
      }
    } );

  },

  resetPageItems( currentState, data, page = 1 ) {

    var changes = {
      search: {}
    };

    changes.search.pageRange = {
      $set: [ parseInt( page ), parseInt( page ) ]
    };

    changes.search.agendas = {
      $set: data.agendas
    };

    changes.search.total = {
      $set: data.total
    };

    return update( currentState, changes );

  },

  addPageItems( currentState, next, data ) {

    var changes = {
      search: {}
    };

    changes.search.pageRange = {
      $set: [
        currentState.search.pageRange[ 0 ] + ( next ? 0 : -1 ),
        currentState.search.pageRange[ 1 ] + ( next ? 1 : 0 )
      ]
    };

    if ( next ) {

      changes.search.agendas = {
        $push: data.agendas
      }

    } else {

      changes.search.agendas = {
        $splice: [ [ 0, 0 ].concat( data.agendas ) ]
      };

    }

    return update( currentState, changes );

  },

  selectAgenda( currentState, agenda, data, page = 1 ) {

    var changes = {};

    changes.agenda = {
      $set: agenda
    };

    changes.membersPageRange = {
      $set: [ parseInt( page ), parseInt( page ) ]
    };

    changes.membersTotal = {
      $set: data.total
    };

    changes.members = {
      $set: data.members
    };

    return update( currentState, changes );

  },

  addMembersItems( currentState, next, data ) {

    var changes = {};

    changes.membersPageRange = {
      $set: [
        currentState.membersPageRange[ 0 ] + ( next ? 0 : -1 ),
        currentState.membersPageRange[ 1 ] + ( next ? 1 : 0 )
      ]
    };

    changes.membersTotal = {
      $set: data.total
    };

    if ( next ) {

      changes.members = {
        $push: data.members
      }

    } else {

      changes.members = {
        $splice: [ [ 0, 0 ].concat( data.members ) ]
      };

    }

    return update( currentState, changes );

  }
};
