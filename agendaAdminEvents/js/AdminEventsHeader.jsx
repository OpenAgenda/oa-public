var React = require('react'),

TermSelector = require( 'agenda-locations/components/TermSelector.jsx' ),

qs = require( 'qs' ),

labels = require( 'labels/agenda-admin-events/filters' ),

getLabel = require( 'labels' )( labels ),

Select = require( 'react-select' ),

AdminEventsHeader = React.createClass({

  onKeyUp: function( field ) {

    var self = this;

    return function( e ) {

      if ( e.keyCode == 13 ) {

        self.setQueryPart( field, e.target.value );

      }

    }

  },

  getStateOptions: function() {

    return [ {
      label: getLabel( 'tobecontrolled', this.props.lang ),
      value: 'tobecontrolled'
    }, {
      label: getLabel( 'controlled', this.props.lang ),
      value: 'controlled'
    }, {
      label: getLabel( 'published', this.props.lang ),
      value: 'published'
    }, {
      label: getLabel( 'featured', this.props.lang ),
      value: 'featured'
    }, {
      label: getLabel( 'all', this.props.lang ),
      value: 'all'
    } ]

  },

  // state is in query
  render: function() {

    var self = this;

    return (
      <div className="row admin-events-header">
        <div className="col col-sm-12">
          <div className="form-inline">
            <div className="form-group">
              <label>{getLabel( 'filterList', this.props.lang )}</label>
              <input
                className="form-control"
                placeholder={getLabel( 'title', this.props.lang )}
                value={this.getQueryPart( 'title' )}
                onKeyUp={this.onKeyUp( 'title' )} />
              <input
                className="form-control"
                placeholder={getLabel( 'locationName', this.props.lang )}
                value={this.getQueryPart( 'locationName' )}
                onKeyUp={this.onKeyUp( 'locationName' )} />
              <TermSelector
                field="region"
                placeholder={getLabel( 'region', this.props.lang )}
                value={this.getQueryPart( 'region' )}
                res={this.props.res.terms}
                onChange={function( term ) {
                  self.setQueryPart( 'region', term );
                }}
              />
              <div className="state-control">
                <Select
                  value={this.getQueryPart( 'state' )}
                  options={self.getStateOptions()}
                  clearable={false}
                  placeholder={getLabel( 'state', this.props.lang )}
                  onChange={function( state ) {
                    self.setQueryPart( 'state', state );
                  }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  },

  getQueryPart: function( name ) {

    var query = this.getQuery();

    return query[ name ];

  },

  setQueryPart: function( name, value ) {

    var query = this.getQuery();

    query[ name ] = value;

    window.location.href = window.location.href.split( '?' )[ 0 ] + '?' + qs.stringify( query );

  },

  getQuery: function() {

    var parts = window.location.href.split( '?' );

    return parts.length > 1 ? qs.parse( parts[ 1 ] ) : {};

  }

});

module.exports = AdminEventsHeader;