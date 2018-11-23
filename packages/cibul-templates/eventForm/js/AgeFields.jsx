import React from 'react';
import Select from 'react-select';
import createReactClass from 'create-react-class';
import labels from '@openagenda/labels/cibul-templates/age-fields';

const limits = {
  min: 0,
  max: 120
};

export default createReactClass({

  getInitialState: function() {

    var enabled = false;

    if ( this.props.value && this.props.value.min !== undefined && this.props.value.min !== null ) {

      enabled = true;

    }

    return {
      enabled: enabled,
    }

  },

  onChange: function( attr ) {

    var self = this;

    return function( e ) {

      var v,

      current = JSON.parse( JSON.stringify( self.props.value ) );

      if ( e.value ) {

        v = e.value;

      } else {

        v = e;

      }

      v = parseInt( v, 10 );

      if ( !isNaN( v ) ) {

        current[ attr ] = v;

      }

      if ( current.min && current.min > self.props.value.max ) {

        current.max = current.min;

      }

      self.props.onChange( current );

    }

  },

  onEnabled: function( enable ) {

    var self = this;

    return function() {

      if ( typeof enable == 'undefined' ) {

        enable = !self.state.enabled;

      }

      var min = null, max = null;

      if ( enable ) {

        min = self.props.value && typeof self.props.value.min !== 'undefined' && self.props.value.min !== null ? self.props.value.min : null;

        max = self.props.value ? self.props.value.max || null : null;

      }

      if ( enable && min === null ) {

        min = 0;

      }

      if ( enable && max === null ) {

        max = 99;

      }

      self.props.onChange( {
        min: min,
        max: max
      } );

      self.setState( {
        enabled: enable
      });

    }

  },

  /**
   * get or build select menu options based on propped language
   */

  getSelectOptions: function( minValue ) {

    this.selectOptions = [];

    if ( typeof minValue == 'undefined' ) {

      minValue = limits.min;

    }

    for ( var i=0; i<limits.max; i++ ) {

      if ( minValue <= i ) {

        this.selectOptions.push( {
          value: i + '',
          label: i + ' ' + ( i < 2 ? labels.year : labels.years )[ this.props.labelsLang ]
        } );

      }

    }

    return this.selectOptions;

  },

  render: function() {

    var min = null, max = null;

    if ( this.state.enabled ) {

      min = this.props.value.min;

      min = ( min !== undefined && min !== null ) ? min + '' : '';

      max = this.props.value.max;

      max = ( max !== undefined && max !== null ) ? max + '' : '';

    }

    return (
      <div className="target-age margin-v-md">
        <label className="checkbox-inline">
          <input type="checkbox" name="age" checked={this.state.enabled} onChange={this.onEnabled(!this.state.enabled )} />
          <span>{this.props.label[this.props.labelsLang]}</span>
          {this.props.info ? <span> - {this.props.info}</span> : null }
        </label>
        <div className="age-inputs">
          <span> - </span>
          <label className="margin-right-sm" onClick={this.onEnabled()} htmlFor="minage">{labels.min[this.props.labelsLang]}</label>
          <Select
            name="minage"
            value={min}
            options={this.getSelectOptions()}
            clearable={false}
            onChange={this.onChange( 'min' )}
            onFocus={this.onEnabled(true )}
            onBlur={this.onChange( 'min' )}
            placeholder={labels.select[this.props.labelsLang]}
          />
          <label className="margin-h-sm" htmlFor="maxage">{labels.max[this.props.labelsLang]}</label>
          <Select
            name="maxage"
            value={max}
            options={this.getSelectOptions( this.props.value ? min : false )}
            clearable={false}
            onChange={this.onChange( 'max' )}
            onBlur={this.onChange( 'max' )}
            onFocus={this.onEnabled(true)}
            placeholder={labels.select[this.props.labelsLang]}
          />
        </div>
      </div>
    );

  }

});
