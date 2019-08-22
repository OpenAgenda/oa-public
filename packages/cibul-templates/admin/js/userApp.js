import _ from 'lodash';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import ReactTable from 'react-table';
import UserList from './userList';
import UserSearch from './userSearch';
import UserPagination from './userPagination';
import UserShow from './userShow';
import remote from '../../js/lib/remote/remote.mod';

const defaults = {
  all: {
    res: {
      users: '/admin/users',
      activate: '/admin/users/activate',
      update: '/admin/users/update',
      signin: '/admin/users/signin',
      changePassword: '/admin/users/changePassword'
    }
  },
  tpl: {
    res: {
      users: '/server/testdata/adminusers.json',
      activate: '/server/testdata/adminusersactivate.json'
    }
  }
};

const config = ( [ 'tpl' ].indexOf( window.env ) !== 1 )
  ? _.assign( {}, defaults.all, defaults[ window.env ] )
  : defaults.all;

class UserApp extends Component {

  constructor(props) {
    super( props );
    this.get = ::this.get;
    this.handleChangePassword = ::this.handleChangePassword;
    this.handlePageSelect = ::this.handlePageSelect;
    this.handleSearchSubmit = ::this.handleSearchSubmit;
    this.handleUserActivation = ::this.handleUserActivation;
    this.handleUserUpdate = ::this.handleUserUpdate;
    this.handleUserSignin = ::this.handleUserSignin;
    this.viewSessions = ::this.viewSessions;
  }

  state = {
    users: [],
    perPage: 40,
    total: 0,
    displaySessionModal: false
  };

  componentDidMount() {

    this.search();

  }

  viewSessions() {

    this.setState( { displaySessionModal: !this.state.displaySessionModal } );


  }

  get( uid ) {

    remote.getXmlHttp( config.res.users, { timeout: 10000, data: { uid: uid } }, ( responseType, data ) => {

      if ( responseType !== 'success' ) return alert( 'schplof.' );

      this.setState( {
        user: data.user,
        stakeholders: data.stakeholders
      } );

    } );

  }

  search( searchValue, page ) {

    const searchQuery = {
      page: page ? page : 1
    };

    const currentSearch = searchValue;

    if ( currentSearch && currentSearch.length ) {

      searchQuery.search = currentSearch;

    }

    this.searchQuery = searchQuery;

    remote.getXmlHttp( config.res.users, { data: searchQuery }, ( responseType, data ) => {

      if ( responseType !== 'success' ) return alert( 'schplof.' );

      this.setState( {
        page: data.page,
        users: data.users,
        total: data.total,
        perPage: data.perPage
      } );

    } );

  }

  handleSearchSubmit( search ) {

    this.search( search );

  }

  handlePageSelect( page ) {

    this.search( this.searchQuery.search, page );

  }

  handleUserUpdate( data ) {

    remote.postXmlHttp( config.res.update, { data: { ...data, uid: this.state.user.uid} }, ( responseType, result ) => {

      if ( responseType !== 'success' ) return alert( 'schplof.' );

      if ( !result.success ) return alert( result.message );

      this.setState( { user: result.user } );

    } );

  }

  handleUserActivation( e ) {

    e.preventDefault();

    remote.getXmlHttp( config.res.activate, { data: { uid: this.state.user.uid } }, ( responseType, data ) => {

      if ( responseType !== 'success' ) return alert( 'schplof.' );

      if ( !data.success ) return alert( data.message );

      var user = this.state.user;

      user.isActivated = true;

      this.setState( { user: user } );

    } );

  }

  handleUserSignin( e ) {

    e.preventDefault();

    remote.getXmlHttp( config.res.signin, { data: { uid: this.state.user.uid } }, ( responseType, data ) => {

      if ( responseType !== 'success' ) return alert( 'schplof.' );

      if ( !data.success ) return alert( data.message );

      window.location.href = '/home';

    } );

  }

  handleChangePassword( data ) {

    return new Promise( ( resolve, reject ) => {

      const { password } = data;
      const { user: { uid } } = this.state;

      if ( !uid || !password ) return reject();

      remote.getXmlHttp( config.res.changePassword, { data: { uid, password } }, ( responseType, data ) => {

        if ( responseType !== 'success' ) return reject();

        return resolve();

      } );

    } );

  }

  render() {

    const { page, perPage, total, users, displaySessionModal, user, stakeholders } = this.state;

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2>Users</h2>
            <p>
              <a role="button" onClick={this.viewSessions}>Voir les sessions ouvertes</a>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <UserSearch
              onSearchSubmit={this.handleSearchSubmit}
            />
            <UserPagination
              page={page}
              perPage={perPage}
              total={total}
              onPageSelect={this.handlePageSelect}
            />
            <UserList
              users={users}
              onUserClick={this.get}
            />
          </div>
          <div className="col-md-8">
            <UserShow
              user={user}
              stakeholders={stakeholders}
              onUserActivation={this.handleUserActivation}
              onUserSignin={this.handleUserSignin}
              onUserChangePassword={this.handleChangePassword}
              onUserUpdate={this.handleUserUpdate}
            />
          </div>
        </div>

        {displaySessionModal && <div className="modal" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                Sessions ouvertes
              </div>
              <div className="modal-body">
                <ReactTable
                  columns={[{
                    header: 'First Name',
                    accessor: 'firstName'
                  }, {
                    header: 'Last Name',
                    id: 'lastName',
                    accessor: d => d.lastName
                  }, {
                    header: 'Age',
                    accessor: 'age'
                  }]}
                  manual // Forces table not to paginate or sort automatically, so we can handle it server-side
                  defaultPageSize={10}
                  data={this.state.data} // Set the rows to be displayed
                  pages={this.state.pages} // Display the total number of pages
                  loading={this.state.loading} // Display the loading overlay when we need it
                  onChange={this.fetchData} // Request new data when things change
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.viewSessions}>
                  Close
                </button>
                <button type="button" className="btn btn-primary">Save changes</button>
              </div>
            </div>
          </div>
        </div>}
      </div>
    );
  }
}

export default canvasElem => {

  ReactDom.render( <UserApp />, canvasElem );

};
