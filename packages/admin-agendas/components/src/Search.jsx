"use strict";

var React = require( "react" ),

  SearchField = require( 'react-form-components/build/SearchField' ),

  List = require( 'react-components/build/List' ),

  AgendaItem = require( './AgendaItem' );

module.exports = React.createClass( {

  displayName: 'Search',

  propTypes: {
    query: React.PropTypes.object,
    agendas: React.PropTypes.array,
    total: React.PropTypes.number,
    pageRange: React.PropTypes.arrayOf( React.PropTypes.number ),
    onSelectAgenda: React.PropTypes.func,
    onSearchChange: React.PropTypes.func,
    getSearchPage: React.PropTypes.func
  },

  render(){

    return <div className="col-md-3 admin-search" ref="search">
      <div className="row">
        <div className="header">
          <div className="form-group">
            <label className="sr-only" htmlFor="agenda_search">Agenda search</label>
            <SearchField
              name="oas[search]"
              label="Search"
              placeholder="Search"
              value={ this.props.query ? this.props.query.search : '' }
              onChange={this.props.onSearchChange}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="body media-list">
          <List
            items={this.props.agendas} // a 'get' can maybe be given in props differently here from server?
            total={this.props.total}
            pageRange={this.props.pageRange}
            getPage={this.props.getSearchPage}
            renderItem={ i => <AgendaItem agenda={i} key={i.uid} onSelect={this.props.onSelectAgenda}/> }
            renderEmpty={() => <div className="empty"><p>Sorry, no agendas match this search</p></div>}
          />
        </div>
      </div>
    </div>;

  }

} );