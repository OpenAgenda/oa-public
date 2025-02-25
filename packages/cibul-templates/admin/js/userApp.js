import _ from 'lodash';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import qs from 'qs';
import UserList from './userList';
import UserSearch from './userSearch';
import UserPagination from './userPagination';
import UserShow from './userShow';
import remote from '../../js/lib/remote';

const defaults = {
  all: {
    res: {
      users: '/admin/users',
      activate: '/admin/users/activate',
      blacklist: '/admin/users/blacklist',
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
    this.get = this.get.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handlePageSelect = this.handlePageSelect.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    this.handleUserActivation = this.handleUserActivation.bind(this);
    this.handleUserIsBlacklistedToggle = this.handleUserIsBlacklistedToggle.bind(this);
    this.handleUserUpdate = this.handleUserUpdate.bind(this);
    this.handleUserSignin = this.handleUserSignin.bind(this);
  }

  state = {
    users: [],
    perPage: 40,
    total: 0
  };

  componentDidMount() {

    this.search();

    const query = window.location.search
      ? qs.parse(window.location.search, { ignoreQueryPrefix: true })
      : {};

    if (query.userUid) {
      this.get(query.userUid);
    }

  }

  get( uid ) {

    remote.getXmlHttp( config.res.users, { timeout: 10000, data: { uid: uid } }, ( responseType, data ) => {

      if ( responseType !== 'success' ) return alert( 'schplof.' );

      const search = qs.stringify({
        ...qs.parse(window.location.search, { ignoreQueryPrefix: true }),
        userUid: uid
      }, { addQueryPrefix: true });

      window.history.replaceState( {} , document.title, `${window.location.pathname}${search}` );

      this.setState( {
        user: data.user,
        members: data.members
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

  handleUserIsBlacklistedToggle() {

    remote.getXmlHttp( config.res.blacklist, { data: { uid: this.state.user.uid, isBlacklisted: !this.state.user.isBlacklisted } }, ( responseType, data ) => {

      if ( responseType !== 'success' ) return alert( 'schplof.' );

      if ( !data.success ) return alert( data.message );

      var user = this.state.user;

      user.isBlacklisted = !user.isBlacklisted;

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

    const { page, perPage, total, users, user, members } = this.state;

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2>Users</h2>
            <div class="margin-bottom-sm">
              <label>Account activation mode</label>: <span>{this.props.accountActivationMode === 'manual' ? 'Manual' : 'Automatic'}</span> -&rarr; 
              <span>{this.props.accountActivationMode === 'manual' ? 'Accounts must be checked on Slack' : 'Users can activate their own accounts'}</span>
              <a
                href={'/admin/users/activationMode?mode=' + (this.props.accountActivationMode === 'manual' ? 'automatic' : 'manual')}
                className="btn btn-link"
              >{this.props.accountActivationMode === 'manual' ? 'Switch to automatic' : 'Switch to manual'}</a>
            </div>
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
              members={members}
              onUserActivation={this.handleUserActivation}
              onUserIsBlacklistedToggle={this.handleUserIsBlacklistedToggle}
              onUserSignin={this.handleUserSignin}
              onUserChangePassword={this.handleChangePassword}
              onUserUpdate={this.handleUserUpdate}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default canvasElem => {

  ReactDom.render( <UserApp accountActivationMode={canvasElem.getAttribute('data-account-activation-mode')} />, canvasElem );

};
