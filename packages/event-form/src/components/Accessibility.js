import _ from 'lodash';
import React, { Component } from 'react';

import mLabels from '@openagenda/labels/event/accessibility';
import flatten from '@openagenda/labels/flatten';

const TYPES = [ 'hi', 'sl', 'vi', 'pi', 'mi' ];

module.exports = class AccessibilityComponent extends Component {

  constructor( props ) {

    super( props );

    const { value } = props;

    this.state = { enabled: this.hasAccessibility() }

  }

  getDefault() {

    return TYPES.reduce( ( c, t ) => { c[ t ] = false; return c; }, {} );

  }

  hasAccessibility() {

    const value = this.props.value || this.getDefault();

    return !!_.keys( value ).filter( k => value[ k ] ).length;

  }

  toggleEnabled() {

    const enabled = !this.state.enabled;

    this.setState( { enabled } );

    if ( !enabled && this.hasAccessibility() ) {

      this.props.onChange( this.getDefault() );

    }

  }

  toggleAccessibility( type ) {

    const value = this.props.value || this.getDefault();

    this.props.onChange( _.set( value, type, !value[ type ] ) );

  }

  render() {

    const { value, lang } = this.props;

    const labels = flatten( mLabels, lang, true );

    return <div className="accessibility form-group">
      <div className="checkbox">
        <label>
          <input type="checkbox" checked={this.state.enabled} onChange={this.toggleEnabled.bind( this )}/>
          {labels.input}
        </label>
      </div>
      { this.state.enabled && <div className="accessibility-detail margin-left-md margin-top-md">{
        TYPES.map( ( type, i ) => <div className={ 'checkbox ' + type + ( i + 1 < TYPES.length ? ' margin-bottom-md' : ' margin-bottom-xs' ) } key={type}>
          <label>
            <input type="checkbox" checked={!!_.get( value, type )} onChange={this.toggleAccessibility.bind( this, type )}/>
            <i></i>{labels[ type ]}
          </label>
        </div> )
      }</div> }
    </div>

  }

}

