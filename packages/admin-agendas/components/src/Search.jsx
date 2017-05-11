"use strict";

var React = require( 'react' ),

  PropTypes = require( 'prop-types' ),

  createReactClass = require( 'create-react-class' ),

  SearchField = require( 'react-form-components/build/SearchField' ),

  List = require( 'react-components/build/List' ),

  Spinner = require( 'react-form-components/build/Spinner' ),

  AgendaItem = require( './AgendaItem' );


const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};


module.exports = createReactClass( {

  displayName: 'Search',

  propTypes: {
    query: PropTypes.object,
    agendas: PropTypes.array,
    total: PropTypes.number,
    pageRange: PropTypes.arrayOf( PropTypes.number ),
    onSelectAgenda: PropTypes.func,
    onSearchChange: PropTypes.func,
    getSearchPage: PropTypes.func
  },

  render(){

    return <div className="col-md-3 admin-search" ref="search">
      <div className="row">
        <div className="header">
          {/*<div className="form-group">
            <label className="sr-only" htmlFor="agenda_search">Agenda search</label>
            <SearchField
              name="oas[search]"
              label="Search"
              placeholder="Search"
              value={ this.props.query ? this.props.query.search : '' }
              onChange={this.props.onSearchChange}
            />
          </div>*/}

          <div className="form-group">
            <label className="sr-only" htmlFor="agenda_search">Agenda search</label>
            <div className="input-icon-right">
              <input
                className="form-control"
                placeholder="Search"
                value={ this.props.query ? this.props.query.search : '' }
                onChange={e => this.props.onSearchChange( 'oas[search]', e.target.value )}
              />
              <button type="submit" className="btn">
                {this.props.loading ? <Spinner spinner={searchSpinner} /> : <i className="fa fa-search" aria-hidden="true"></i>}
              </button>
            </div>
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
            renderItem={ i => <AgendaItem agenda={i} key={i.uid} onSelect={this.props.onSelectAgenda} /> }
            renderEmpty={() => <div className="empty"><p>Sorry, no agendas match this search</p></div>}
          />
        </div>
      </div>
    </div>;

  }

} );