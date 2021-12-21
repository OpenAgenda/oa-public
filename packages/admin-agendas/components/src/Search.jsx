"use strict";

var React = require( 'react' ),

  PropTypes = require( 'prop-types' ),

  createReactClass = require( 'create-react-class' ),

  { Spinner } = require( '@openagenda/react-shared' ),

  AgendaItem = require( './AgendaItem' );


const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};


export default createReactClass( {

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
                {this.props.loading ? <Spinner options={searchSpinner} /> : <i className="fa fa-search" aria-hidden="true"></i>}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="body media-list">
          {this.props.agendas?.length
            ? this.props.agendas.map(agenda => <AgendaItem agenda={agenda} key={agenda.uid} onSelect={this.props.onSelectAgenda} />)
            : <div className="empty"><p>Sorry, no agendas match this search</p></div>}
        </div>
      </div>
    </div>;

  }

} );
