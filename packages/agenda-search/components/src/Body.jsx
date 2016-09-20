"use strict";

var React = require( 'react' ),

  AgendaItem = require( './AgendaItem' ),

  SearchField = require( 'react-form-components/build/SearchField' ),

  Spinner = require( 'react-form-components/build/Spinner' ),

  List = require( 'react-components/build/List' ),

  get = require( 'utils/get' ),

  actions = require( './actions' ),

  utils = require( 'utils' ),

  getLabel = require( 'labels' )( require( 'labels/agenda-search' ) ),

  documentLocation = require( 'dom-utils/documentLocation' ),

  monitorField = require( './monitorField' );

module.exports = React.createClass( {

  displayName: 'Body',

  propTypes: {
    res: React.PropTypes.string,
    agendas: React.PropTypes.array,
    page: React.PropTypes.number,
    lang: React.PropTypes.string,
    official: React.PropTypes.bool,
    search: React.PropTypes.string
  },

  getDefaultProps() {

    return {
      res: '/',
      agendas: [],
      page: 1,
      lang: 'fr',
      search: null,
      official: null
    }

  },

  getInitialState() {

    monitorField( '.js_agenda_search', this.resetPage );

    return {
      total: this.props.total,
      agendas: this.props.agendas,
      pageRange: [ this.props.page, this.props.page ],
      search: this.props.search, // only true at init
      official: this.props.official
    }

  },

  getPage( next ) {

    if ( this.state.loading ) return;

    let query = {
      search: this.state.search,
      page: this.state.pageRange[ next ? 1 : 0 ] + ( next ? +1 : -1 )
    }

    if ( this.state.official !== null ) {

      query.official = this.state.official;

    }

    if ( this.state.agendas.length >= this.state.total ) return;

    this.setState( { loading: true } );

    get( this.props.res, utils.extend( { preventCache: Math.random() }, query ), ( err, data ) => {

      if ( err ) {

        this.setState( { loading: false } );

        return console.log( 'error', err );

      }

      let change = actions.addPageItems( this.state, next, data );

      change.loading = false;

      this.setState( change );

      documentLocation.setQueryPart( query );

    } );

  },

  onSearchChange( name, search ) {

    this.resetPage( search );

  },

  resetPage( newQuery ) {

    this.setState( { loading: true } );

    get( this.props.res, {
      search: newQuery,
      page: 1
    }, ( err, data ) => {

      if ( err ) return console.log( 'error', err );

      let changes = actions.resetPageItems( this.state, newQuery, data );

      this.setState( changes );

      documentLocation.setQueryPart( {
        search: newQuery,
        page: 1
      } );

    } );

  },

  renderHead() {

    return <div className="header">
      <h1>{getLabel( 'latestUpdated', this.props.lang )}</h1>
    </div>

  },

  renderSearchHead() {

    return <div className="header">
      <h1>{getLabel( 'results', { search: this.state.search }, this.props.lang )}</h1>
      <span>{getLabel( 'found', { count: this.state.total }, this.props.lang )}</span>
    </div>

  },
  
  render() {

    return <div className="container agenda-search top-margined">
      <div className="row">
        <div className="wsq col-sm-8 col-sm-offset-2">
          { this.state.loading ? <Spinner/> : null }
          { this.state.search ? this.renderSearchHead() : this.renderHead() }
          <div className="body media-list">
            {this.state.agendas.length ? <List
              query={this.state.search}
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