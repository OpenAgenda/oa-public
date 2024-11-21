import React from 'react';
import PropTypes from 'prop-types';
import Search from './Search';
import Details from './Details';
import actions from './actions';
import get from '@openagenda/utils/get';
import post from '@openagenda/utils/post';
import { getSupportedLocale } from '@openagenda/intl';
import { Modal, AuthenticateAndConfirm } from '@openagenda/react-shared';
import debounce from 'lodash/debounce';
import qs from 'qs';
import { IntlProvider } from 'react-intl';
import { locales } from '@openagenda/react-shared';

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

function getQuery() {
  return qs.parse(location.search, { ignoreQueryPrefix: true });
}

export default class Body extends React.Component {

  constructor( props ) {
    super( props );

    this.debouncedSearch = this.debouncedSearch.bind(this);
    this.search = this.search.bind(this);
    this.resetSearchPage = this.resetSearchPage.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.getSearchPage = this.getSearchPage.bind(this);
    this.onSelectAgenda = this.onSelectAgenda.bind(this);
    this.getMembersPage = this.getMembersPage.bind(this);
    this.setAgenda = this.setAgenda.bind(this);
    this.displayConfirmDelete = this.displayConfirmDelete.bind(this);
  }

  static propTypes = {
    searchRes: PropTypes.string,
    agendaRes: PropTypes.string,
    setAgendaRes: PropTypes.string,
    membersRes: PropTypes.string,

    agenda: PropTypes.object
  };

  state = {
    loading: true,
    search: {
      query: {},
      agendas: [],
      total: 0,
      pageRange: [ 1, 1 ]
    },
    agenda: {},
    members: [],
    membersPageRange: [ 1, 1 ],
    membersTotal: 0,
    displayDeleteModal: false,
  }

  componentDidMount() {

    this.setState( actions.loading( this.state, false ) );

    let q = Object.assign( {}, {
      oas: {
        search: ''
      },
      searchPage: 1,
      agendaUid: null,
      agendaId: null,
      membersPage: 1
    }, getQuery() );

    if ( !this.state.search.agendas.length ) this.resetSearchPage( q.oas, q.searchPage, () => {
      if ( q.agendaUid ) this.onSelectAgenda( q.agendaUid, q.membersPage );
    } );

  }

  displayConfirmDelete() {
    this.setState({ displayDeleteModal: true });
  }

  onSearchChange( name, search ) {

    this.resetSearchPage( {
      search: search
    } );

  }

  resetSearchPage( newQuery, page = 1, cb ) {

    var query = {
      oas: newQuery,
      searchPage: page
    };

    this.setState( actions.setSearch( this.state, newQuery ) );

    this.debouncedSearch( query, page, cb );

  }

  search( query, page, cb ) {

    this.setState( actions.loading( this.state, true ) );

    get( this.props.searchRes, query, ( err, data ) => {

      this.setState( actions.loading( this.state, false ) );

      if ( err ) return console.log( 'error', err );

      this.setState( actions.resetPageItems( this.state, data, page ) );
  
      updateHref( Object.assign( getQuery() || {}, query ) );

      if (data.total === 1) {
        this.onSelectAgenda(data.agendas[0].uid);
      }

      if ( cb ) cb();

    } );

  }

  debouncedSearch = debounce( this.search, 500 );

  getSearchPage( next ) {

    if ( this.state.loading ) return;

    var query = {
      oas: this.state.search.query,
      searchPage: this.state.search.pageRange[ next ? 1 : 0 ] + ( next ? +1 : -1 )
    };

    if ( this.state.search.agendas.length >= this.state.search.total ) return;

    this.setState( actions.loading( this.state, true ) );

    get( this.props.searchRes, query, ( err, data ) => {

      if ( err ) return console.log( 'error', err );

      this.setState( actions.loading( this.state, false ) );

      this.setState( actions.addPageItems( this.state, next, data ) );

      updateHref( Object.assign( getQuery() || {}, query ) );

    } );

  }

  onSelectAgenda( uid, page = 1 ) {

    var query = {
      agendaUid: uid,
      membersPage: page
    };

    get( this.props.membersRes, query, ( err, members ) => {

      if ( err ) return console.log( 'error', err );

      get( this.props.agendaRes.replace(':uid', uid), {}, ( err, agenda ) => {

        if ( err ) return console.log( 'error', err );

        this.setState( actions.selectAgenda( this.state, agenda, members, page ) );

        updateHref( Object.assign( getQuery() || {}, query ) );

      } );

    } );

  }

  getMembersPage( next ) {

    if ( this.state.loading ) return;

    var query = {
      agendaUid: this.state.agenda.uid,
      membersPage: this.state.membersPageRange[ next ? 1 : 0 ] + ( next ? +1 : -1 )
    };

    if ( this.state.members.length >= this.state.membersTotal ) return;

    this.setState( actions.loading( this.state, true ) );

    get( this.props.membersRes, query, ( err, data ) => {

      if ( err ) return console.log( 'error', err );

      this.setState( actions.loading( this.state, false ) );

      this.setState( actions.addMembersItems( this.state, next, data ) );

      updateHref( Object.assign( getQuery() || {}, query ) );

    } );

  }

  setAgenda( data ) {

    return new Promise( ( resolve, reject ) => {

      post( `${this.props.setAgendaRes}/${this.state.agenda.uid}`, data, ( err, result ) => {

        if ( err ) return reject( err );

        this.setState( { agenda: result.agenda } );

        resolve( result );

      } );

    } );

  }

  render() {

    const {
      displayDeleteModal,
      agenda,
    } = this.state;

    return (
      <IntlProvider
        key="fr"
        locale="fr"
        messages={locales.fr}
        defaultLocale={getSupportedLocale('fr')}
      >
        <div className="admin">
          <div className="container-fluid">
            <div className="row">
              <Search
                query={this.state.search.query}
                agendas={this.state.search.agendas}
                total={this.state.search.total}
                pageRange={this.state.search.pageRange}
                getSearchPage={this.getSearchPage}
                onSelectAgenda={this.onSelectAgenda}
                onSearchChange={this.onSearchChange}
                loading={this.state.loading}
              />
              <Details
                agenda={this.state.agenda}
                members={this.state.members}
                total={this.state.membersTotal}
                pageRange={this.state.membersPageRange}
                getMembersPage={this.getMembersPage}
                setAgenda={this.setAgenda}
                displayConfirmDelete={this.displayConfirmDelete}
                updateHref={updateHref}
                getQuery={getQuery}
              />
              {displayDeleteModal ? (
                <Modal
                  onClose={() => { this.setState({ displayDeleteModal: false }); }}
                  title="Suppression d'agenda"
                >
                  <AuthenticateAndConfirm
                    method="delete"
                    message="MdP StP."
                    res={`/api/agendas/${agenda.uid}`}
                    onSuccess={() => {
                      window.location.href = '/admin/agendas';
                    }}
                  />
                </Modal>
              ) : null}
              
            </div>
          </div>
        </div>
      </IntlProvider>
    );

  }

};

function updateHref( query ) {

  let q = Object.assign( {}, {
    oas: {
      search: ''
    },
    searchPage: 1,
    membersPage: 1,
    tab: 'members'
  }, query );

  if ( q.searchPage <= 1 ) delete q.searchPage;
  if ( q.oas.search == '' ) delete q.oas.search;
  if ( q.membersPage <= 1 ) delete q.membersPage;
  if ( q.tab == 'members' ) delete q.tab;

  const qStr = qs.stringify(q, { addQueryPrefix: true });

  window.history.pushState(q, '', window.location.pathname + qStr);

}
