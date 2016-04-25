"use strict";

var React = require( "react" ),

  Search = require( './Search' ),

  Details = require( './Details' ),

  actions = require( './actions' ),

  get = require( 'utils/get' ),

  updateHref = require( 'dom-utils/documentLocation' ).setQueryPart,

  getQuery = require( 'dom-utils/documentLocation' ).getQuery;

module.exports = React.createClass( {

  displayName: 'Body',

  propTypes: {
    searchRes: React.PropTypes.string,
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
    if ( !this.state.search.agendas.length ) this.resetSearchPage( {} );

  },

  onSearchChange( name, search ) {

    this.resetSearchPage( {
      search: search
    } );

  },

  resetSearchPage( newQuery ) {

    var query = {
      oas: newQuery,
      searchPage: 1
    };

    get( this.props.searchRes, query, ( err, data ) => {

      if ( err ) return console.log( 'error', err );

      this.setState( actions.resetPageItems( this.state, newQuery, data ) );

      updateHref( Object.assign( getQuery() || {}, query ) );

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

  onSelectAgenda( id ) {

    var agenda =  this.state.search.agendas.filter(v => v.id == id)[0];

    var query = {
      agendaId: id
    };

    get( this.props.stakeholdersRes, query, ( err, data ) => {

      if ( err ) return console.log( 'error', err );

      this.setState( actions.selectAgenda( this.state, agenda, data ) );

      updateHref( Object.assign( getQuery() || {}, query ) );

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
          />
        </div>
      </div>
    </div>;

  }

} );