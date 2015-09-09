"use strict";

var React = require( 'react'),

rUtils = require( './reactUtils.js' ),

defaults = {
  canvas: '.js_form_canvas',
  events: {
    send: 'eaccessibilitysend'
  }
};

module.exports = React.createClass({

  types: [{
    code: 'mi',
    label: {
      en: 'motor impairment',
      fr: 'handicap moteur'
    }
  }, {
    code: 'hi',
    label: {
      en: 'hearing impairment',
      fr: 'handicap auditif'
    }
  },{
    code: 'pi',
    label: {
      en: 'mental impairment',
      fr: 'handicap psychique'
    }
  },{
    code: 'vi',
    label: {
      en: 'visual impairment',
      fr: 'handicap visuel'
    }
  }, { 
    code: 'sl', 
    label: {
      en: 'sign language',
      fr: 'language des signes'
    }
  }],

  getInitialState: function() {

    return {
      enabled: !!this.props.value.length
    }

  },

  onEnabled: function( e ) {

    var enabled = !this.state.enabled;

    if ( !enabled ) this.props.onChange( [] );

    this.setState( {
      enabled: enabled
    } );

  },

  onClick: function( type ) {

    var self = this;

    return function() {

      self.toggleState( type.code );

    }

  },

  toggleState: function( code ) {

    var current = this.props.value.slice(),

    codeIndex = current.indexOf( code );

    if ( codeIndex == -1 ) {

      current.push( code );

    } else {

      current.splice( codeIndex, 1 );

    }

    this.props.onChange( current );

  },

  render: function() {

    var self = this;

    return (
      <div className="cform">
        <ul>
          <li className="line" onClick={self.onEnabled}>
            <input type="checkbox" name="accessibility" checked={self.state.enabled} />
            <label>{this.props.label[ this.props.labelsLang ]}</label>
          </li>
        </ul>
        <ul className="acc">
          {this.types.map(function(type, idx){
            return <AccessibilityItem 
              key={idx}
              label={type.label[self.props.labelsLang]}
              checked={self.props.value.indexOf(type.code)!==-1}
              code={type.code}
              onClick={self.onClick( type )}
              enabled={self.state.enabled}
            />;
          })}
        </ul>
      </div>
    );

  }

});

var AccessibilityItem = React.createClass({

  onClick: function() {

    this.props.onClick( this.props.code );

  },

  render: function(){

    return (
      <li className={this.props.enabled ? 'line' : 'display-none'} onClick={this.onClick}>
        <div className={ 'box' + ( this.props.checked ? ' checked' : '' ) }>
          <div className={'ill ' + this.props.code }></div>
        </div>
        <label>{this.props.label}</label>
      </li>
    );

  }

});