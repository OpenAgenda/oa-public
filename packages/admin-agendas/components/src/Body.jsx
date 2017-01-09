"use strict";

var React = require( "react" ),

  Search = require( './Search' ),

  Details = require( './Details' ),

  actions = require( './actions' ),

  get = require( 'utils/get' ),

  post = require( 'utils/post' ),

  _updateHref = require( 'dom-utils/documentLocation' ).setQueryPart,

  getQuery = require( 'dom-utils/documentLocation' ).getQuery;

module.exports = React.createClass( {

  displayName: 'Body',

  propTypes: {
    searchRes: React.PropTypes.string,
    agendaRes: React.PropTypes.string,
    setAgendaRes: React.PropTypes.string,
    stakeholdersRes: React.PropTypes.string,

    agenda: React.PropTypes.object
  },

  getInitialState() {

    return {
      loading: true,
      search: {
        query: {},
        agendas: [],
        total: 0,
        pageRange: [ 1, 1 ]
      },
      agenda: {},
      stakeholders: [],
      stakeholdersPageRange: [ 1, 1 ],
      stakeholdersTotal: 0
    }

  },

  componentDidMount() {

    this.setState( actions.loading( this.state, false ) );

    let q = Object.assign( {}, {
      oas: {
        search: ''
      },
      searchPage: 1,
      agendaId: null,
      stakeholdersPage: 1
    }, getQuery() );

    if ( !this.state.search.agendas.length ) this.resetSearchPage( q.oas, q.searchPage, () => {
      if ( q.agendaId ) this.onSelectAgenda( q.agendaId, q.stakeholdersPage );
    } );

  },

  onSearchChange( name, search ) {

    this.resetSearchPage( {
      search: search
    } );

  },

  resetSearchPage( newQuery, page = 1, cb ) {

    var query = {
      oas: newQuery,
      searchPage: page
    };

    get( this.props.searchRes, query, ( err, data ) => {

      if ( err ) return console.log( 'error', err );

      this.setState( actions.resetPageItems( this.state, newQuery, data, page ) );

      updateHref( Object.assign( getQuery() || {}, query ) );

      if ( cb ) cb();

    } );

  },

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

  },

  onSelectAgenda( id, page = 1 ) {

    var query = {
      agendaId: id,
      stakeholdersPage: page
    };

    get( this.props.stakeholdersRes, query, ( err, stakeholders ) => {

      if ( err ) return console.log( 'error', err );

      get( this.props.agendaRes, { id }, ( err, agenda ) => {

        if ( err ) return console.log( 'error', err );

        this.setState( actions.selectAgenda( this.state, agenda, stakeholders, page ) );

        updateHref( Object.assign( getQuery() || {}, query ) );

      } );

    } );

  },

  getStakeholdersPage( next ) {

    if ( this.state.loading ) return;

    var query = {
      agendaId: this.state.agenda.id,
      stakeholdersPage: this.state.stakeholdersPageRange[ next ? 1 : 0 ] + ( next ? +1 : -1 )
    };

    if ( this.state.stakeholders.length >= this.state.stakeholdersTotal ) return;

    this.setState( actions.loading( this.state, true ) );

    get( this.props.stakeholdersRes, query, ( err, data ) => {

      if ( err ) return console.log( 'error', err );

      this.setState( actions.loading( this.state, false ) );

      this.setState( actions.addStakeholdersItems( this.state, next, data ) );

      updateHref( Object.assign( getQuery() || {}, query ) );

    } );

  },

  setAgenda( data ) {

    return new Promise( ( resolve, reject ) => {

      post( `${this.props.setAgendaRes}/${this.state.agenda.uid}`, data, ( err, result ) => {

        if ( err ) return reject( err );

        this.setState( { agenda: result.agenda } );

        resolve( result );

      } );

    } );

  },

  render() {

    return <div className="admin">
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
          />
          <Details
            agenda={this.state.agenda}
            stakeholders={this.state.stakeholders}
            total={this.state.stakeholdersTotal}
            pageRange={this.state.stakeholdersPageRange}
            getStakeholdersPage={this.getStakeholdersPage}
            setAgenda={this.setAgenda}
            updateHref={updateHref}
            getQuery={getQuery}
          />
        </div>
      </div>
    </div>;

  }

} );

function updateHref( query ) {

  let q = Object.assign( {}, {
    oas: {
      search: ''
    },
    searchPage: 1,
    stakeholdersPage: 1,
    tab: 'stakeholders'
  }, query );

  if ( q.searchPage <= 1 ) delete q.searchPage;
  if ( q.oas.search == '' ) delete q.oas.search;
  if ( q.stakeholdersPage <= 1 ) delete q.stakeholdersPage;
  if ( q.tab == 'stakeholders' ) delete q.tab;

  _updateHref( q );

}