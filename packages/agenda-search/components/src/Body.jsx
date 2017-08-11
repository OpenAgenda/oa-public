"use strict";

var React = require( 'react' ),

  PropTypes = require( 'prop-types' ),

  createReactClass = require( 'create-react-class' ),

  AgendaItem = require( './AgendaItem' ),

  SearchField = require( 'react-form-components/build/SearchField' ),

  Spinner = require( 'react-form-components/build/Spinner' ),

  List = require( 'react-components/build/List' ),

  get = require( 'utils/get' ),

  actions = require( './actions' ),

  utils = require( 'utils' ),

  getLabel = require( 'labels' )( require( 'labels/agenda-search' ) ),

  documentLocation = require( 'dom-utils/documentLocation' ),

  monitorField = require( './monitorField' ),

  validateQuery = require( '../../validators/query' );

module.exports = createReactClass( {

  displayName: 'Body',

  propTypes: {
    res: PropTypes.string,
    agendas: PropTypes.array,
    page: PropTypes.number,
    lang: PropTypes.string,
    query: PropTypes.object
  },

  getDefaultProps() {

    return {
      res: '/',
      agendas: [],
      page: 1,
      lang: 'fr',
      query: null
    }

  },

  getInitialState() {

    monitorField( '.js_agenda_search', search => this.resetPage( { search } ) );

    let query = {};

    try {

      query = validateQuery( this.props.query );

    } catch ( e ) {

      console.error( 'query is not valid: %s', this.props.query );

    }

    return {
      total: this.props.total,
      agendas: this.props.agendas,
      pageRange: [ this.props.page, this.props.page ],
      query
    }

  },

  prepareGetQuery( query, page ) {

    return utils.extend( {
      page: page
    }, query );

  },

  getPage( next ) {

    if ( this.state.loading ) return;

    let page = this.state.pageRange[ next ? 1 : 0 ] + ( next ? +1 : -1 );

    if ( this.state.agendas.length >= this.state.total ) return;

    this.setState( { loading: true } );

    get( this.props.res, this.getHrefQuery( utils.extend( { preventCache: Math.random(), page }, this.state.query ) ), ( err, data ) => {

      if ( err ) {

        this.setState( { loading: false } );

        return console.log( 'error', err );

      }

      let change = actions.addPageItems( this.state, next, data );

      change.loading = false;

      this.setState( change );

      documentLocation.setQueryPart( this.getHrefQuery( utils.extend( { page }, this.state.query ) ) );

    } );

  },

  onSearchChange( name, search ) {

    this.resetPage( { search } );

  },

  resetPage( newQuery ) {

    this.setState( { loading: true } );

    get( this.props.res, this.getHrefQuery( utils.extend( { page: 1 }, newQuery ) ), ( err, data ) => {

      if ( err ) return console.log( 'error', err );

      this.setState( actions.resetPageItems( this.state, newQuery, data ) );

      documentLocation.setQueryPart( this.getHrefQuery( utils.extend( { page: 1 }, newQuery ) ) );

    } );

  },

  getHrefQuery( query ) {

    let filtered = {};

    Object.keys( query ).forEach( k => {

      if ( query[ k ] === null ) return;

      if ( typeof query[ k ] === 'string' && !query[ k ].length ) return;

      filtered[ k ] = query[ k ];

    } );

    return filtered;

  },

  renderHead() {

    return <div className="header">
      <h1>{getLabel( 'latestUpdated', this.props.lang )}</h1>
    </div>

  },

  renderSearchHead() {

    return <div className="header">
      <h1>{getLabel( 'results', { search: this.state.query.search }, this.props.lang )}</h1>
      <span>{getLabel( 'found', { count: this.state.total }, this.props.lang )}</span>
    </div>

  },
  
  render() {

    return <div className="container agenda-search top-margined">
      <div className="row">
        <div className="wsq col-sm-8 col-sm-offset-2">
          { this.state.loading ? <Spinner/> : null }
          { this.state.query.search ? this.renderSearchHead() : this.renderHead() }
          <div className="body media-list">
            {this.state.agendas.length ? <List
              query={this.state.query}
              pageRange={this.state.pageRange}
              getPage={this.getPage}
              total={this.state.total}
              prevLabel={getLabel('loadPrevious', this.props.lang)}
              nextLabel={getLabel('loadNext', this.props.lang)}
              items={this.state.agendas} // a 'get' can maybe be given in props differently here from server?
              renderItem={ i => <AgendaItem agenda={i} key={i.uid} lang={this.props.lang}/> }
            /> : <div className="empty"><p>{getLabel( 'empty', this.props.lang ) }</p></div> }
          </div>
        </div>
      </div>
    </div>

  }

} );