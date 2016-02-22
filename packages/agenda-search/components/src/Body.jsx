"use strict";

var React = require( 'react' ),

AgendaItem = require( './AgendaItem.js' ),

SearchField = require( 'react-form-components/build/SearchField.js' ),

List = require( './List' ),

get = require( './get' ),

actions = require( './actions' ),

updateHref = require( './updateHref' );

module.exports = React.createClass( {

  propTypes: {
    res: React.PropTypes.string,
    agendas: React.PropTypes.array,
    page: React.PropTypes.number
  },

  getDefaultProps() {

    return {
      res: '/',
      agendas: [],
      page: 1
    }

  },

  getInitialState() {

    return {
      total: this.props.total,
      agendas: this.props.agendas,
      pageRange: [ this.props.page, this.props.page ],
      query: this.props.query, // only true at init
    }

  },

  getPage( next ) {

    if ( this.state.loading ) return;

    let query = {
      oas: this.state.query,
      page: this.state.pageRange[ next ? 1 : 0 ] + ( next ? +1 : -1 )
    }

    if ( this.state.agendas.length >= this.state.total ) return;

    this.setState( { loading: true } );

    get( this.props.res, query, ( err, data ) => {

      if ( err ) {

        this.setState( { loading: false } );

        return console.log( 'error', err );

      }

      let change = actions.addPageItems( this.state, next, data );

      change.loading = false;

      this.setState( change );

      updateHref( query );

    } );

  },

  onSearchChange( name, search ) {

    this.resetPage( {
      search: search
    } );

  },

  resetPage( newQuery ) {

    get( this.props.res, {
      oas: newQuery,
      page: 1
    }, ( err, data ) => {

      if ( err ) return console.log( 'error', err );

      let changes = actions.resetPageItems( this.state, newQuery, data );

      this.setState( changes );

      updateHref( {
        oas: newQuery,
        page: 1
      } );

    } );

  },

  render() {

    return <div className="container">
      <div className="row">
        <div className="col-sm-8 col-sm-offset-2 wsq header">
          <div className="form-group">
            <label className="sr-only" for="agenda_search">Agenda search</label>
            <SearchField
              name="oas[search]"
              label="Search"
              placeholder="Search"
              value={ this.state.query ? this.state.query.search : '' }
              onChange={this.onSearchChange}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-8 col-sm-offset-2 wsq body media-list agenda-search">
          {this.state.agendas.length ? <List
            query={this.state.query}
            pageRange={this.state.pageRange}
            getPage={this.getPage}
            total={this.state.total}
            items={this.state.agendas} // a 'get' can maybe be given in props differently here from server?
            renderItem={ i => <AgendaItem agenda={i} key={i.uid}/> }
          /> : <div className="empty"><p>Sorry, no agendas match this search</p></div> }
        </div>
      </div>
    </div>

  }

} );