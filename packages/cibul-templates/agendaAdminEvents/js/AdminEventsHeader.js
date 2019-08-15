import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import qs from 'qs';
import Select from 'react-select';
import TermSelectorPicker from '@openagenda/agenda-locations/components/build/TermSelectorPicker';
import du from '@openagenda/dom-utils';
import labels from '@openagenda/labels/agenda-admin-events/filters';
import stateLabels from '@openagenda/labels/event/states';
import makeGetterLabel from '@openagenda/labels';
import Spinner from '@openagenda/react-components/build/Spinner';
import utils from '@openagenda/utils';
import UidTextField from './UidTextField.jsx';
import MemberTextField from './MemberTextField.jsx';

const getLabel = makeGetterLabel( labels );
const getStateLabel = makeGetterLabel( stateLabels );

const LocationField = UidTextField( 'locationName', 'locationUid' );
const ContributorField = MemberTextField( 'contributor', 'contributorId' );

const AdminEventsHeader = createReactClass( {

  propTypes: {

    lang: PropTypes.string

  },

  componentWillMount() {

    const bodyData = du.parseJsonAttribute( 'body', 'data-options' );

    this.state.slug = bodyData.agenda && bodyData.agenda.slug;

  },

  getDefaultProps: function () {

    return {

      lang: 'en',

      geographicFields: {

        region: 'region,country',

        department: 'department,region',

        city: 'city,region'

      }

    }

  },

  getInitialState: function () {

    var term = this.loadTerm();

    return {

      temporary: {},

      term: term,

      loading: false

    };

  },

  loadTerm: function () {

    var fields = Object.keys( this.props.geographicFields ),

      terms = {}, self = this;

    fields.forEach( function ( f ) {

      terms[ f == 'country' ? 'countryCode' : f ] = self.getQueryPart( f );

    } );

    return terms;

  },

  onTermChange: function ( term ) {

    this.setState( {
      term: term
    } );

    // if this is a field switch, do not refresh
    if ( utils.size( term ) == 1 ) return;

    this.setQueryParts( term, this.getGeographicDefaults() );

  },


  // get default values for geographic filter

  getGeographicDefaults: function () {

    var defaults = [], obj = {};

    for ( var f in this.props.geographicFields ) {

      defaults = defaults.concat( this.props.geographicFields[ f ].split( ',' ) );

    }

    utils.unique( defaults ).forEach( function ( f ) {

      obj[ f ] = undefined;

    } );

    return obj;

  },

  onChange: function ( field ) {

    var self = this;

    return function ( e ) {

      var temporary = JSON.parse( JSON.stringify( self.state.temporary ) );

      temporary[ field ] = e.target.value;

      self.setState( { temporary: temporary } );

    }

  },

  onUidFieldChange: function ( uidName, textName ) {

    var self = this;

    return function ( e ) {

      var temporary = JSON.parse( JSON.stringify( self.state.temporary ) );

      temporary[ textName ] = e.target.value;

      temporary[ uidName ] = undefined;

      self.setState( { temporary: temporary } );

    }

  },

  onBlur: function ( field ) {

    var self = this;

    return function ( e ) {

      self.setQueryParts( self.state.temporary );

    }

  },

  onKeyUp: function ( field ) {

    var self = this;

    return function ( e ) {

      if ( e.keyCode == 13 ) {

        self.setQueryParts( self.state.temporary );

      }

    }

  },

  getStateOptions: function () {

    return [ {
      label: getStateLabel( 'refused', this.props.lang ),
      value: 'refused'
    }, {
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

  render: function () {

    var self = this;

    return (

      <div className="row admin-events-header">

        {this.state.loading ? <Spinner page={true} message={getLabel( 'loading', this.props.lang )} /> : null}

        <div className="col col-sm-2">
          <div className="form-group">
            <div className="state-control">
              <Select
                value={this.getQueryPart( 'state' )}
                options={self.getStateOptions()}
                clearable={false}
                placeholder={getStateLabel( 'state', this.props.lang )}
                onChange={function ( state ) {
                  self.setQueryPart( 'state', state.value );
                }} />
            </div>
          </div>
        </div>

        <div className="col col-sm-10">
          <div className="row margin-bottom-xs">
            <div className="col-sm-6">
              <input
                className="form-control"
                placeholder={getLabel( 'title', this.props.lang )}
                value={this.getQueryPart( 'title' )}
                onChange={this.onChange( 'title' )}
                onKeyUp={this.onKeyUp( 'title' )} />
            </div>
            <div className="col-sm-6">
              <LocationField
                res={this.props.res.location}
                getQueryPart={this.getQueryPart}
                onChange={this.onUidFieldChange( 'locationUid', 'locationName' )}
                onKeyUp={this.onKeyUp( 'locationName' )}
                onBlur={this.onBlur( 'locationName' )}
                placeholder={getLabel( 'locationName', this.props.lang )} />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <ContributorField
                res={this.props.res.contributor}
                getQueryPart={this.getQueryPart}
                onChange={this.onUidFieldChange( 'contributorId', 'contributor' )}
                onKeyUp={this.onKeyUp( 'contributor' )}
                placeholder={getLabel( 'contributor', this.props.lang )} />
            </div>
            <div className="col-sm-6">
              <TermSelectorPicker
                lang={this.props.lang}
                fields={this.props.geographicFields}
                defaultField='region'
                res={this.props.res.terms}
                value={this.state.term}
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

  getQueryPart: function ( name ) {

    if ( this.state && typeof this.state.temporary[ name ] !== 'undefined' ) {

      return this.state.temporary[ name ];

    } else {

      var query = this.getQuery();

      return query[ name ];

    }

  },

  setQueryPart: function ( name, value ) {

    var query = this.getQuery();

    query[ name ] = value;

    this.setQuery( query );

  },

  setQueryParts: function ( value, defaults ) {

    var query = this.getQuery();

    utils.extend( query, defaults, value );

    if ( query.country ) {

      query.countryCode = query.country.code;

      query.country = undefined;

    }

    this.setQuery( query );

  },

  setQuery: function ( q ) {

    this.setState( { loading: true } );

    var href = window.location.href.split( '#' )[ 0 ].split( '?' )[ 0 ];

    window.location.href = href + '?' + qs.stringify( q );

  },

  getQuery: function () {

    var parts = window.location.href.split( '#' )[ 0 ].split( '?' );

    return parts.length > 1 ? qs.parse( parts[ 1 ] ) : {};

  }

} );


module.exports = AdminEventsHeader;
