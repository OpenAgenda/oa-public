"use strict";

var React = require( 'react'),

createReactClass = require( 'create-react-class' ),

rUtils = require( './reactUtils.js' ),

defaults = {
  canvas: '.js_form_canvas',
  events: {
    send: 'eaccessibilitysend'
  }
},

labels = require( 'labels/event/accessibility' );

module.exports = createReactClass({

  types: [ {
    code: 'mi',
    label: labels.motorImpairment
  }, {
    code: 'hi',
    label: labels.hearingImpairment
  }, {
    code: 'pi',
    label: labels.mentalImpairment
  }, {
    code: 'vi',
    label: labels.visualImpairment
  }, { 
    code: 'sl',
    label: labels.signLanguage
  } ],

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

    return (
      <div className="accessibility">
        <div onClick={this.onEnabled} className="checkbox">
          <label><input type="checkbox" name="accessibility" checked={this.state.enabled} /> {this.props.label[ this.props.labelsLang ]}</label>
          {this.props.info ? <span className="info">{this.props.info[ this.props.labelsLang ]}</span> : null }
        </div>
        <ul className="list-unstyled">
          {this.types.map( (type, idx) => {
            return <AccessibilityItem 
              key={idx}
              label={type.label[this.props.labelsLang]}
              checked={this.props.value.indexOf(type.code)!==-1}
              code={type.code}
              onClick={this.onClick( type )}
              enabled={this.state.enabled}
            />;
          })}
        </ul>
      </div>
    );

  }

});

var AccessibilityItem = createReactClass({

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