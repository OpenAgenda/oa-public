var React = require( 'react' ),

UserList = require( './userList' ),

UserSearch = require( './userSearch' ),

UserPagination = require( './userPagination' ),

UserShow = require( './userShow' ),

remote = require( '../../js/lib/remote/remote.mod' ),

cn = require( '../../js/lib/common/common.mod' ),

defaults = {
  all: {
    res: {
      users: '/admin/users',
      activate: '/admin/users/activate'
    }
  },
  tpl: {
    res: {
      users: '/server/testdata/adminusers.json',
      activate: '/server/testdata/adminusersactivate.json'
    }
  },
},

config = ( [ 'tpl' ].indexOf( window.env ) !== 1 ) ? cn.extend( {}, defaults.all, defaults[ window.env ] ) : defaults.all,

UserApp = React.createClass({

  getInitialState: function() {
    return {
      users: [],
      perPage: 40,
      total: 0
    }
  },

  componentDidMount: function() {

    this.search();

  },

  get: function( uid ) {

    var self = this;

    remote.getXmlHttp( config.res.users, { data: { uid: uid } }, function( success, data ) {

      self.setState( { user: data.user } );

    } );

  },

  search: function( searchValue, page ) {

    var self = this,

    searchQuery = {
      page: page ? page : 1
    };

    currentSearch = searchValue;

    if ( currentSearch && currentSearch.length ) {

      searchQuery.search = currentSearch;

    }

    remote.getXmlHttp( config.res.users, { data: searchQuery }, function( success, data ) {

      if ( self.isMounted() ) {

        self.setState( {
          page: data.page,
          users: data.users,
          total: data.total,
          perPage: data.perPage
        } );

      }

    });

  },

  handleSearchSubmit: function( search ) {

    this.search( search );
    
  },

  handlePageSelect: function( page ) {

    this.search( currentSearch, page );

  },

  handleUserActivation: function( e ) {

    var self = this;

    e.preventDefault();

    remote.getXmlHttp( config.res.activate, { data: { uid: this.state.user.uid } }, function( responseType, data ) {

      if ( !responseType == 'success' ) return alert( 'schplof.' );

      if ( !data.success ) return alert( data.message );

      var user = self.state.user;

      user.isActivated = true;

      self.setState( { user: user } );

    });

  },

  render: function() {

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2>Users</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <UserSearch onSearchSubmit={this.handleSearchSubmit} />
            <UserPagination page={this.state.page} perPage={this.state.perPage} total={this.state.total} onPageSelect={this.handlePageSelect}/>
            <UserList users={this.state.users} onUserClick={this.get} />
          </div>
          <div className="col-md-8">
            <UserShow user={this.state.user} onUserActivation={this.handleUserActivation} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = function( canvasElem ) {

  React.render( <UserApp/>, canvasElem );

}