var React = require('react'),

TermSelectorPicker = require( 'agenda-locations/components/TermSelectorPicker.jsx' ),

qs = require( 'qs' ),

labels = require( 'labels/agenda-admin-events/filters' ),

stateLabels = require( 'labels/event/states' ),

getLabel = require( 'labels' )( labels ),

getStateLabel = require( 'labels' )( stateLabels ),

Select = require( 'react-select' ),

utils = require( 'utils' ),

AdminEventsHeader = React.createClass({

  propTypes: {
    lang: React.PropTypes.string
  },

  getDefaultProps: function() {

    return {
      lang: 'en',
      geographicFields: {
        region: 'region,country',
        department: 'department,region',
        city: 'city,region'
      }
    }

  },

  getInitialState: function() {

    var term = this.loadTerm();

    return {
      temporary: {},
      term: term
    }

  },

  loadTerm: function() {

    var fields = Object.keys( this.props.geographicFields ),

    terms = {}, self = this;

    fields.forEach( function( f ) {

      terms[ f == 'country' ? 'countryCode' : f ] = self.getQueryPart( f );

    } );

    return terms;

  },

  onTermChange: function( term ) {

    this.setState( {
      term: term
    } );

    // if this is a field switch, do not refresh

    if ( utils.size( term ) == 1 ) {

      return;

    }

    this.setQueryParts( term, this.getGeographicDefaults() );

  },

  // get default values for geographic filter
  getGeographicDefaults: function() {

    var defaults = [], obj = {};

    for ( var f in this.props.geographicFields ) {

      defaults = defaults.concat( this.props.geographicFields[ f ].split( ',' ) );

    }

    utils.unique( defaults ).forEach( function( f ) {

      obj[ f ] = undefined;

    } );

    return obj;

  },

  onChange: function( field ) {

    var self = this;

    return function( e ) {

      var temporary = JSON.parse( JSON.stringify( self.state.temporary ) );

      temporary[ field ] = e.target.value;

      self.setState( { temporary: temporary } );

    }

  },

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
      label: getStateLabel( 'tobecontrolled', this.props.lang ),
      value: 'tobecontrolled'
    }, {
      label: getStateLabel( 'controlled', this.props.lang ),
      value: 'controlled'
    }, {
      label: getStateLabel( 'published', this.props.lang ),
      value: 'published'
    }, {
      label: getStateLabel( 'featured', this.props.lang ),
      value: 'featured'
    }, {
      label: getStateLabel( 'all', this.props.lang ),
      value: 'all'
    } ]

  },

  // state is in query
  render: function() {

    var self = this;

    return (
      <div className="row admin-events-header">
        <div className="col col-sm-2">
          <div className="form-group">
            <div className="state-control">
              <Select
                value={this.getQueryPart( 'state' )}
                options={self.getStateOptions()}
                clearable={false}
                placeholder={getStateLabel( 'state', this.props.lang )}
                onChange={function( state ) {
                  self.setQueryPart( 'state', state );
                }} />
            </div>
          </div>
        </div>
        <div className="col col-sm-10">
          <div className="form-inline">
            <div className="form-group">
              <input
                className="form-control"
                placeholder={getLabel( 'title', this.props.lang )}
                value={this.getQueryPart( 'title' )}
                onChange={this.onChange( 'title' )}
                onKeyUp={this.onKeyUp( 'title' )} />
              <input
                className="form-control"
                placeholder={getLabel( 'locationName', this.props.lang )}
                value={this.getQueryPart( 'locationName' )}
                onChange={this.onChange( 'locationName' )}
                onKeyUp={this.onKeyUp( 'locationName' )} />
            </div>
            <div className="form-group">
            
              <input
                className="form-control"
                placeholder={getLabel( 'contributor', this.props.lang )}
                value={this.getQueryPart( 'contributor' )}
                onChange={this.onChange( 'contributor' )}
                onKeyUp={this.onKeyUp( 'contributor' )} />

              <TermSelectorPicker
                lang={this.props.lang}
                fields={this.props.geographicFields}
                defaultField='region'
                res={this.props.res.terms}
                value={ this.state.term }
                labels={{
                  region: { fr: 'région', en: 'region' },
                  department: { fr: 'département', en: 'department' },
                  city: { fr: 'ville', en: 'city' }
                }}
                onChange={this.onTermChange}
              />

            </div>
          </div>
        </div>
      </div>
    );

  },

  getQueryPart: function( name ) {

    if ( this.state && typeof this.state.temporary[ name ] !== 'undefined' ) {

      return this.state.temporary[ name ];

    } else {

      var query = this.getQuery();

      return query[ name ];

    }

  },

  setQueryPart: function( name, value ) {

    var query = this.getQuery();

    query[ name ] = value;

    this.setQuery( query );

  },

  setQueryParts: function( value, defaults ) {

    var query = this.getQuery();

    utils.extend( query, defaults, value );
    
    if ( query.country ) {

      query.countryCode = query.country.code;

      query.country = undefined;

    }

    this.setQuery( query );

  },

  setQuery: function( q ) {

    var href = window.location.href.split( '#' )[ 0 ].split( '?' )[ 0 ];

    window.location.href = href + '?' + qs.stringify( q );

  },

  getQuery: function() {

    var parts = window.location.href.split( '#' )[ 0 ].split( '?' );

    return parts.length > 1 ? qs.parse( parts[ 1 ] ) : {};

  }

});

module.exports = AdminEventsHeader;