import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import React from 'react';
import update from 'immutability-helper';

import base64 from '@openagenda/utils/base64';
import errorLabels from '@openagenda/labels/errors';
import flattenLabels from '@openagenda/labels/flatten';
import formLabels from '@openagenda/labels/agenda-locations/form';
import get from '@openagenda/utils/get';
import GroupTagSelector from '@openagenda/react-form-components/build/GroupTagSelector';
import ImageUpload from '@openagenda/image-upload/components/build/ImageUploader';
import InputField from '@openagenda/react-form-components/build/InputField';
import LanguageBar from '@openagenda/react-form-components/build/LanguageBar';
import MultiInputField from '@openagenda/react-form-components/build/MultiInputField';
import MultilingualInputField from '@openagenda/react-form-components/build/MultilingualInputField';
import post from '@openagenda/utils/post';
import Spinner from '@openagenda/react-components/build/Spinner';
import utils from '@openagenda/utils';

import actions from './formActions';
import CountryField from './CountryField';
import LocationMap from './LocationMap';
import StateToggler from './StateToggler';
import suggestionHelpers from './suggestions.helpers.js';
import validate from './validate';

const _ = {
  assign: require( 'lodash/assign' ),
  extend: require( 'lodash/extend' ),
  get: require( 'lodash/get' ),
  first: require( 'lodash/first' ),
  keys: require( 'lodash/keys' ),
  pick: require( 'lodash/pick' ),
  upperCase: require( 'lodash/upperCase' ),
  isString: require( 'lodash/isString' )
}

const alternativeMaxLength = 50;

const labels = _.extend( {}, formLabels, errorLabels );

module.exports = createReactClass( {

  propTypes: {

    lang: PropTypes.string,

    // server endpoints for set, merge and geocode
    res: PropTypes.object,

    // enable geocoder
    enableGeocode: PropTypes.bool,

    // show verified toggler
    showToggler: PropTypes.bool,

    // if set, we are editing a location
    location: PropTypes.object,

    // optional settings of agenda ( such as tags requirements )
    settings: PropTypes.object,

    // toggle display of location detailed info fields ( description, website, phone... )
    detailedInfo: PropTypes.bool,

    // takes location and update mode ( true if is )
    onSuccess: PropTypes.func,

    // overloading labels
    labels: PropTypes.object,

    // alternative to loaded location values
    alternatives: PropTypes.array,

    // hide alternative when loaded in current values
    hideCurrentAlternative: PropTypes.bool

  },

  getDefaultProps() {

    return {
      cancel: false, // cancel link if different
      showToggler: false,
      enableGeocode: true,
      detailedInfo: false,
      settings: {},
      labels: {},
      alternatives: [],
      hideCurrentAlternative: false,
      disableNoAlternatives: false,
      displayLanguageTabs: true
    }

  },

  getInitialState() {

    this.actions = actions( {
      getState: () => {
        return this.state
      },
      setState: newState => {
        this.setState( newState );
      },
    } );

    let initialState = this.actions.initialize( this.props );

    return initialState;

  },

  getLanguages() {

    let languages = Object.keys( this.getMultilingual( 'description' ) );

    if ( !languages.length ) languages.push( this.props.lang );

    return languages;

  },

  componentWillMount() {

    this.setState( {
      originScrollPosition: ( window.pageYOffset || document.documentElement.scrollTop ) - ( document.documentElement.clientTop || 0 )
    } );

  },

  componentDidMount() {

    this.setState( {
      originScrollPosition: ( window.pageYOffset || document.documentElement.scrollTop ) - ( document.documentElement.clientTop || 0 )
    }, () => {

      window.scrollTo( 0, this.formPos() )

    } );

  },

  formPos( obj ) {

    var obj = this[ 'location-form' ];

    var o = 0;

    if ( obj.offsetParent ) {

      do {
        o += obj.offsetTop;
      } while ( obj = obj.offsetParent );

    }

    return o;

  },

  componentWillUnmount() {

    var scrollTo = this.state.originScrollPosition;

    setTimeout( () => {

      window.scrollTo( 0, scrollTo );

    }, 100 );

  },

  isNew() {

    return !( this.props.location && this.props.location.uid );

  },

  isFieldEnabled( name ) {

    if ( !this.props.disableNoAlternatives ) return true;

    return suggestionHelpers.fieldHasAlternative( name, this.props.alternatives );

  },

  getMultilingual( field ) {

    var data = this.state.location[ field ];

    var defaultData = {};

    defaultData[ this.props.lang ] = '';

    if ( data && typeof data == 'object' ) {

      return data;

    } else if ( typeof data == 'string' ) {

      defaultData[ this.props.lang ] = data;

      return defaultData;

    }

    return data || defaultData;

  },

  getLabel( name, values ) {

    let str, k;

    // see if label is defined in agenda settings
    if ( this.props.settings && this.props.settings.labels && this.props.settings.labels[ name ] ) {

      let l = this.props.settings.labels[ name ];

      str = _.get( l, this.props.lang, l[ _.first( _.keys( l ) ) ] );

    } else if ( this.props.labels[ name ] || labels[ name ] ) {

      let l = ( this.props.labels[ name ] || labels[ name ] );

      str = _.get( l, this.props.lang, l[ _.first( _.keys( l ) ) ] );

    }

    if ( !str ) {

      return null;

    }

    if ( values ) {

      for ( k in values ) {

        str = str.replace( '%' + k + '%', values[ k ] );

      }

    }

    return str;

  },

  editGeocode( field, value ) {

    this.setState( { geocodeEdit: field, geocodeEditValue: value } );

  },

  setGeocodeFieldValue( field, value ) {

    const updated = {
      location: {}
    };

    updated.location[ field ] = { $set: value };

    updated.geocodeEdit = { $set: null };

    this.setState( update( this.state, updated ) );

  },

  cancelEditGeocode() {

    this.setState( { geocodeEdit: false } );

  },

  updateLocationReverseGeocode( latitude, longitude ) {

    this.setState( {
      geocodeLoading: true,
      geocodeEdit: false
    } );

    log( 'reverse geocode from latitude %s and longitude %s', latitude, longitude );

    get( this.props.res.reverseGeocode, {
      latitude: latitude,
      longitude: longitude
    }, ( err, result ) => {

      if ( err ) {

        return log( 'error', err );

      }

      let updated = {
        geocodeLoading: { $set: false },
        geocodeError: { $set: false },
        geocodeEdit: { $set: false }
      };

      updated.location = this.decorateLocation( result, true );

      this.setState( update( this.state, updated ) );

    } );

  },

  updateLocationGeocode( value, setLoading ) {

    if ( setLoading ) {

      this.setState( {
        geocodeLoading: true,
        geocodeEdit: false
      } );

    }

    if ( value === undefined ) {

      value = this.state.location.address;

    }

    log( 'getting geocode data for address %s in country %s', value, this.state.location.countryCode );

    get( this.props.res.geocode, {
      address: value,
      countryCode: this.state.location.countryCode
    }, ( err, result ) => {

      let updated = {
        geocodeLoading: { $set: false },
        geocodeError: { $set: false },
        geocodeEdit: { $set: false }
      };

      if ( err ) {

        log( 'error', err );

        _.assign( updated, {
          geocodeError: { $set: true },
          location: {
            latitude: { $set: this.state.location.latitude || 0 },
            longitude: { $set: this.state.location.longitude || 0 }
          }
        } );

      } else if ( result.results.length ) {

        const location = this.decorateLocation( result );

        if ( _.get( location, 'latitude' ) && _.get( location, 'longitude' ) && _.upperCase( _.get( this.state, 'location.countryCode' ) ) === 'FR' ) {

          this.fetchINSEE( _.first( result.results ) );

        }

        updated.location = location;

        updated.autoGeocode = { $set: true };

        updated.showGeocodeLink = { $set: false };

      }

      this.setState( update( this.state, updated ) );

    } );

  },

  fetchINSEE( location ) {

    log( 'getting insee data for location %j', location );

    get( this.props.res.insee, _.pick( location, [ 'latitude', 'longitude', 'city', 'department' ] ), ( err, result ) => {

      if ( err ) {

        return log( 'error', err );

      }

      log( 'retrieved insee: %j', result );

      this.setState( {
        location: _.assign( this.state.location, { insee: _.get( result, 'code' ) } )
      } );

    } );

  },

  decorateLocation( gfResult, excludeCoordinates = false ) {

    const item = gfResult.results[ 0 ];

    const decoration = [ 'city', 'district', 'department', 'postalCode', 'region', 'timezone', 'insee' ].reduce( ( d, field ) => {

      d[ field ] = { $set: item[ field ] };

      return d;

    }, {} );

    if ( !excludeCoordinates ) {

      decoration.latitude = { $set: item.latitude };
      decoration.longitude = { $set: item.longitude };

    }

    if ( item.countryCode && item.countryCode !== this.state.location.countryCode ) {

      decoration.countryCode = { $set: _.isString( item.countryCode ) ? item.countryCode.toUpperCase() : null };

    }

    return decoration;

  },

  onChange( name, value ) {

    var updated = { location: {} };

    updated.location[ name ] = { $set: value };

    this.setState( update( this.state, updated ) );

  },

  onLanguagesChange( newLanguages ) {

    var self = this,

      currentLanguages = this.getLanguages(),

      // description field serves as ref for language state
      // this should change but as long as its the only multi-l
      // field, this is how it is
      description = JSON.parse( JSON.stringify( this.getMultilingual( 'description' ) ) );

    currentLanguages.forEach( l => {

      if ( newLanguages.indexOf( l ) == -1 ) {

        delete description[ l ];

      }

    } );

    newLanguages.forEach( l => {

      if ( currentLanguages.indexOf( l ) == -1 ) {

        description[ l ] = '';

      }

    } );

    this.setState( {
      location: update( this.state.location, {
        description: {
          $set: description
        }
      } )
    } );

  },

  onMarkerDragged( pos ) {

    this.setState( update( this.state, {
      autoGeocode: { $set: false },
      location: {
        latitude: { $set: pos.latitude },
        longitude: { $set: pos.longitude }
      }
    } ) );

    if ( !this.state.enableGeocode ) return;

    this.updateLocationReverseGeocode( pos.latitude, pos.longitude );

  },

  /**
   * this bit needs to get latitude & longitude based on address
   */
  onAddressChange( name, value ) {

    if ( !this.state.autoGeocode || !this.state.enableGeocode ) {

      return this.setState( update( this.state, {
        showGeocodeLink: { $set: true },
        location: {
          address: {
            $set: value
          }
        }
      } ) );

    } else {

      // auto-geocode is on; we wait for the user to stop typing away
      // for a short while and we launch the request

      if ( this.bufferTimeout ) {

        clearTimeout( this.bufferTimeout );

      }

      this.setState( update( this.state, {
        geocodeLoading: { $set: true },
        location: {
          address: {
            $set: value
          }
        }
      } ) );

      this.bufferTimeout = setTimeout( () => {

        this.updateLocationGeocode( value );

      }, 2000 );

    }


  },


  /**
   * send location data to server for creation or update
   *
   * if arguments are set, partial update is done
   */
  set ( field, value ) {

    let errors = false, clean;

    // if stuff is given in args, we need to do a partial update only
    let { data, partial } = this.getSetType( arguments );

    try {

      clean = validate( data, this.props.settings, partial );

    } catch ( e ) {

      errors = e;

    }

    if ( errors ) {

      return this.actions.setError( errors );

    }

    if ( partial || !this.isNew() ) {

      clean.uid = this.state.location.uid;

    }

    this.actions.setStart( this.getLabel( 'saving' ) );

    this.post( partial, clean );

  },

  post( partial, clean ) {

    post( this.props.getSetRes ? this.props.getSetRes() : this.props.res.set, clean, ( err, result ) => {

      if ( err ) {

        log( 'error', err );

        return this.actions.setErrorResponse( this.getLabel( 'loadingError' ) );

      }

      if ( !result.success ) {

        return this.actions.setErrorResponse( this.getLabel( 'loadingError' ) );

      }

      this.actions.setSuccess( result.location );

      if ( result.success ) {

        this.props.onSuccess( result.location, !partial );

      }

    } );

  },

  getSetType( args ) {

    let data = {}, partial,

      field = args[ 0 ], value = args[ 1 ];

    if ( args.length == 2 ) {

      data[ field ] = value;

      partial = true;

    } else {

      data = this.state.location;

      partial = false;

    }

    return { data, partial };

  },

  renderAlternative( fieldName, pasteNames ) {

    log( 'renderAlternative - field %s', fieldName );

    if ( !this.props.alternatives || !this.props.alternatives.length ) {

      return null;

    }

    const items = this.props.alternatives

      .map( ( l, i ) => {

        if ( !l.location[ fieldName ] ) return null;

        let value = l.location[ fieldName ];

        if ( utils.isArray( value ) ) {

          value = value.join( ', ' );

        } else if ( value && typeof value === 'object' && !utils.size( value ) ) {

          return null;

        }

        return <li key={fieldName + i}>
          {l.label ? <label>{l.label}</label> : null}
          <a onClick={e => this.actions.loadAlternative( this.props.alternatives, fieldName, i, pasteNames )}>
            {value.length > alternativeMaxLength ? value.substr( 0, alternativeMaxLength ) + '...' : value}
          </a>
        </li>

      } )
      .filter( v => !!v );

    return items.length ? (
      <div className="alternatives">
        <ul>{items}</ul>
      </div>
    ) : null;

  },

  renderMultilingualAlternatives( fieldName, pasteNames ) {

    return lang => {

      const items = this.props.alternatives

        .map( ( l, i ) => {

          if ( !l.location[ fieldName ] || !l.location[ fieldName ][ lang ] ) {

            return null;

          }

          let lValue = l.location[ fieldName ] && typeof l.location[ fieldName ] === 'object' ? ( l.location[ fieldName ][ lang ] || '' ) : '';

          return <li key={fieldName + lang + i}>
            {l.label ? <label>{l.label}</label> : null}
            <a
              onClick={e => this.actions.loadAlternative( this.props.alternatives, fieldName, i, lang, pasteNames )}>
              {lValue.length > alternativeMaxLength ? lValue.substr( 0, alternativeMaxLength ) + '...' : lValue}
            </a>
          </li>

        } )
        .filter( v => !!v );

      return items.length ? (
        <div className="alternatives">
          <ul>{items}</ul>
        </div>
      ) : null;

    }

  },

  /**
   * render an alternative to tag when at least one alternative
   * differs from location main
   */
  renderTagAlternative( tag, groupIndex, tagIndex ) {

    let differentAlternatives = suggestionHelpers.suggestedTagsDiffer( tag, this.props.location, this.props.alternatives );

    if ( !differentAlternatives.length ) {

      return null;

    }

    let isInLocation = !!( this.props.location.tags || [] ).filter( t => t.id === tag.id ).length,

      alternative = differentAlternatives[ 0 ];

    return <div className="alternatives checkbox-alternatives">
      <ul>
        <li>
          {alternative.label ? <label>{alternative.label} </label> : null}
          <a onClick={e => this.actions.loadTagAlternative( tag, !isInLocation )}>
            <i className={isInLocation ? 'fa fa-square-o' : 'fa fa-check-square-o'}></i> <span>{tag.label}</span>
          </a>
        </li>
      </ul>
    </div>

  },

  renderImageAlternatives() {

    const items = this.props.alternatives

      .map( ( a, i ) => {

        if ( !a.location.image ) return null;

        return <li
          key={'image' + i}
          onClick={e => this.actions.loadAlternative( this.props.alternatives, 'image', i )}
        ><img src={a.location.image} /></li>

      } )
      .filter( v => !!v );

    return items.length ? (
      <div className="alternatives image-alternatives">
        <ul>{items}</ul>
      </div>
    ) : null;

  },

  renderErrors() {

    let errors = this.state.errors.filter( e => {

      return e.field !== 'longitude'; // for displaying, latitude is enough.

    } );

    return <div className="errors">
      <label>{this.getLabel( 'submitError' )}:</label>
      {errors.map( ( err, i ) => {

        var values = {};

        for ( let k in err.values ) {

          values[ '%' + k + '%' ] = err.values[ k ];

        }

        if ( err.group ) {

          return <div key={'err' + i}><label>{err.group}</label>: <span>{this.getLabel( 'required' )}</span></div>

        } else {

          return <div key={'err' + i}><label>{this.getLabel( err.field ) || err.field}</label>:
            <span>{this.getLabel( err.code, values )}</span></div>

        }

      } )}
    </div>

  },

  renderGeocodeButton() {

    return <span className="input-group-btn geocode">
      <button
        className="btn btn-default"
        type="button"
        onClick={this.updateLocationGeocode.bind( null, this.state.location.address, true )}
      >

        {this.state.geocodeLoading
          ? <i style={{ padding: '0.2em 0.65em' }}>
            <Spinner
              loading={this.state.geocodeLoading}
              options={{
                width: 1,
                length: 3,
                radius: 4,
                color: '#666'
              }}
            />
          </i>
          : <i className="fa fa-search"></i>}

      </button>
    </span>

  },

  renderDetailedInfo() {

    var uploadRes, removeRes,

      value = this.state.location.image || null;

    if ( this.isNew() ) {

      uploadRes = this.props.res.image.newUpload;

      removeRes = this.props.res.image.newRemove;

    } else {

      uploadRes = this.props.res.image.upload.replace( ':locationUid', this.state.location.uid );

      removeRes = this.props.res.image.remove.replace( ':locationUid', this.state.location.uid );

    }

    return <div className="form-group">

      <div className={this.isFieldEnabled( 'image' ) ? 'form-group' : 'form-group disabled'}>

        <ImageUpload
          enabled={this.isFieldEnabled( 'image' )}
          value={value}
          upload={uploadRes}
          remove={removeRes}
          info={this.getLabel( 'imageInfo' )}
          lang={this.props.lang}
          handleUpdate={name => {

            this.setState( update( this.state, {
              location: {
                image: { $set: name }
              }
            } ) );

          }}
          bottom={this.renderImageAlternatives()} />

      </div>

      <InputField
        name='imageCredits'
        enabled={this.isFieldEnabled( 'imageCredits' )}
        value={this.state.location.imageCredits}
        getLabel={this.getLabel}
        lang={this.props.lang}
        info="imageCreditsInfo"
        placeholder="imageCreditsPlaceholder"
        onChange={this.onChange}
        bottom={this.renderAlternative( 'imageCredits' )}
        validator={validate.field( 'imageCredits' )} />

      <div className="multilingual-group">

        {this.props.displayLanguageTabs ?

          <LanguageBar
            languages={this.getLanguages()}
            getLabel={this.getLabel}
            onChange={this.onLanguagesChange} />

          : null}

        <MultilingualInputField
          name='description'
          enabled={this.props.disableNoAlternatives ? suggestionHelpers.getLangAlternatives( 'description', this.props.alternatives ) : null}
          value={this.getMultilingual( 'description' )}
          languages={this.getLanguages()}
          getLabel={this.getLabel}
          onChange={this.onChange}
          placeholder={this.getLabel( 'descriptionPlaceholder' )}
          info={this.getLabel( 'descriptionInfo' )}
          bottom={this.renderMultilingualAlternatives( 'description' )}
          type="textarea" />

        <MultilingualInputField
          name='access'
          enabled={this.props.disableNoAlternatives ? suggestionHelpers.getLangAlternatives( 'access', this.props.alternatives ) : null}
          value={this.getMultilingual( 'access' )}
          languages={this.getLanguages()}
          getLabel={this.getLabel}
          onChange={this.onChange}
          placeholder={this.getLabel( 'accessPlaceholder' )}
          info={this.getLabel( 'accessInfo' )}
          bottom={this.renderMultilingualAlternatives( 'access' )}
          type="text" />

      </div>

      <InputField
        name='phone'
        enabled={this.isFieldEnabled( 'phone' )}
        value={this.state.location.phone}
        getLabel={this.getLabel}
        lang={this.props.lang}
        onChange={this.onChange}
        info="phoneInfo"
        placeholder="phonePlaceholder"
        bottom={this.renderAlternative( 'phone' )}
        validator={validate.field( 'phone' )} />

      <InputField
        name='website'
        enabled={this.isFieldEnabled( 'website' )}
        value={this.state.location.website}
        getLabel={this.getLabel}
        lang={this.props.lang}
        info="websiteInfo"
        placeholder="websitePlaceholder"
        onChange={this.onChange}
        bottom={this.renderAlternative( 'website' )}
        validator={validate.field( 'website' )} />

      <InputField
        name='email'
        enabled={this.isFieldEnabled( 'email' )}
        value={this.state.location.email}
        getLabel={this.getLabel}
        lang={this.props.lang}
        info="emailInfo"
        placeholder="emailPlaceholder"
        onChange={this.onChange}
        bottom={this.renderAlternative( 'email' )}
        validator={validate.field( 'email' )} />

      <MultiInputField
        name="links"
        enabled={this.isFieldEnabled( 'links' )}
        info={this.getLabel( 'linksInfo' )}
        placeholder={this.getLabel( 'linksPlaceholder' )}
        value={this.state.location.links}
        getLabel={this.getLabel}
        lang={this.props.lang}
        onChange={this.onChange}
        bottom={this.renderAlternative( 'links' )}
        validator={validate.field( 'links' )} />


      {Object.keys( this.props.settings ).length && this.props.settings.tagSet ?

        <GroupTagSelector
          lang={this.props.lang}
          name='tags'
          set={this.props.settings.tagSet}
          onChange={this.onChange}
          tagBottom={this.renderTagAlternative}
          disabledTagIds={this.props.disableNoAlternatives ? suggestionHelpers.getSameAsSuggestedTagIds( this.props.settings.tagSet, this.props.location, this.props.alternatives ) : []}
          value={this.state.location.tags || []}/>

        : null}

    </div>

  },

  onCancel( e ) {

    e.preventDefault();

    this.props.onCancel( this.state.location );

  },

  renderGeoData() {

    const geo = {};// _.pick( this.state.location,  );

    [ 'region', 'department', 'city', 'postalCode' ].forEach( field => {

      if ( this.state.enableGeocode && !_.get( this.state, [ 'location', field ] ) ) return;

      geo[ field ] = _.get( this.state, [ 'location', field ] );

    } );

    if (
      _.upperCase( _.get( this.state, 'location.countryCode' ) ) === 'FR'
      && _.get( this.state, 'location.latitude' )
    ) {

      geo.insee = _.get( this.state, 'location.insee' );

    }

    if ( this.state.geocodeEdit ) {

      return <div className="form-inline margin-v-xs">
        <div className="form-group">
          <input
            className="form-control margin-right-xs"
            placeholder={this.getLabel(this.state.geocodeEdit)}
            type="text"
            onChange={e => this.editGeocode( this.state.geocodeEdit, e.target.value) }
            value={this.state.geocodeEditValue} />
          <button
            className="btn btn-primary margin-right-xs"
            onClick={() => this.setGeocodeFieldValue( this.state.geocodeEdit, this.state.geocodeEditValue )}
          >{this.getLabel('geocodeFieldSave')}</button>
          <button
            className="btn btn-default"
            onClick={() => this.cancelEditGeocode()}
          >{this.getLabel('geocodeFieldCancel')}</button>
        </div>
      </div>

    }

    return <ul className="list-inline">
      {_.keys( geo ).map( field => <li key={'geo-' + field}>
        <a className="badge badge-default margin-bottom-xs" onClick={() => this.editGeocode( field, _.get( this.state, [ 'location', field ] ) )}>
          <span>{this.getLabel( field )}: {geo[ field ]}&nbsp;</span>
          <i className="fa fa-pencil"></i>
        </a>
      </li> )}
    </ul>

  },

  render() {

    return <div ref={r => this[ 'location-form' ] = r} className="location-form">

      {this.props.Header ? this.props.Header : null}

      {this.props.showToggler ? <StateToggler
        locationState={this.state.location.state}
        onChange={state => this.setState( {
          location: update( this.state.location, {
            state: { $set: state }
          } )
        } ) }
        getLabel={this.getLabel}
      /> : null}

      <InputField
        name="name"
        enabled={this.isFieldEnabled( 'name' )}
        value={this.state.location.name}
        info="nameInfo"
        placeholder="namePlaceholder"
        getLabel={this.getLabel}
        lang={this.props.lang}
        onChange={this.onChange}
        validator={validate.field( 'name' )}
        bottom={this.renderAlternative( 'name' )} />

      <CountryField
        enabled={this.isFieldEnabled( 'countryCode' )}
        value={this.state.location.countryCode}
        lang={this.props.lang}
        onChange={this.onChange}
        getLabel={this.getLabel} />

      <InputField
        name="address"
        enabled={true}
        value={this.state.location.address}
        info="addressInfo"
        placeholder="addressPlaceholder"
        onChange={this.onAddressChange}
        validator={validate.field( 'address' )}
        lang={this.props.lang}
        getLabel={this.getLabel}
        groupClassName="margin-bottom-xs"
        className={this.state.enableGeocode ? 'input-group' : 'form-group'}
        errors={this.state.geocodeError ? [ { code: 'geocodeError' } ] : false}
        renderButton={this.state.enableGeocode ? this.renderGeocodeButton : false}
        bottom={this.renderAlternative( 'address', [ 'address', 'countryCode', 'latitude', 'longitude', 'region', 'department', 'city', 'postalCode', 'timezone' ] )}
        autoFocus={!!this.state.location.name} />

      {this.renderGeoData()}

      { !this.state.enableGeocode ?
        <div className="alert alert-warning" role="alert">{this.getLabel( 'disabledGeocode' )}</div>
      : null }


      <div className={this.isFieldEnabled( 'latitude' ) ? 'form-group' : 'form-group disabled'}>
        <LocationMap
          enabled={this.isFieldEnabled( 'latitude' )}
          resetZoom={this.state.autoGeocode}
          defaultZoom={this.props.enableGeocode ? null : 3}
          location={this.state.location}
          draggableMarker={true}
          onMarkerDragged={this.onMarkerDragged}
          draggable={true} />
      </div>

      {this.props.detailedInfo ? this.renderDetailedInfo() : ''}

      { this.props.detailedInfo && ( this.state.location.extId || this.state.showExtIdInput ? <InputField
        name='extId'
        enabled={this.isFieldEnabled( 'extId' )}
        value={this.state.location.extId}
        getLabel={this.getLabel}
        lang={this.props.lang}
        info="extIdInfo"
        placeholder="extIdplaceholder"
        onChange={this.onChange}
        validator={validate.field( 'extId' )} />
      : <div className="form-group">
        <a className="muted" href="#" onClick={e=>{ e.preventDefault(); this.actions.showExtId() } }>{this.getLabel( 'extIdLink' )}</a>
      </div> ) }

      {this.state.loadingError ? <div className="error">{this.state.loadingError}</div> : ''}

      {this.state.errors ? this.renderErrors() : ''}

      <div className="form-group bottom">

        {this.props.cancel ||
        <a
          href="#"
          onClick={this.onCancel}>{this.getLabel( 'cancel' )}</a>}

        <button
          className="btn btn-primary"
          onClick={e => {
            e.preventDefault();
            this.set();
          }}>{this.getLabel( 'submit' )}</button>

      </div>

      {this.state.pageSpin ? <Spinner page={true} message={this.state.pageSpin.message} /> : null}

    </div>;

  }

} );

function log() {

  if ( !console.log.apply ) return;

  console.log.apply( console, arguments );

}
