"use strict";

var Select = require( 'react-select' ),

React = require( 'react' ),

rUtils = require( './reactUtils.js' ),

defaults = {
  canvas: '.js_form_canvas',
  events: {
    send: 'etypesend'
  }
};

module.exports = function( options ) {

  var params = rUtils.extend( {}, defaults, options );

  React.render(
    <TypeField initType={params.code} lang={params.lang} onChange={rUtils.ehUpdate( params.events.send )} />,
    rUtils.createCanvas( rUtils.el( params.canvas ) )
  );

}


var TypeField = React.createClass({

  labels: {
    label: {
      en: 'Type of the event',
      fr: 'Type de l\'événement'
    }
  },

  types: [{
    code: 'cn',
    label: {
      en: 'Concert',
      fr: 'Concert'
    }
  }, {
    code: 'ex',
    label: {
      en: 'Exhibition',
      fr: 'Exposition'
    }
  }, {
    code: 'th',
    label: {
      en: 'Theater',
      fr: 'Théâtre'
    }
  }, {
    code: 'ot',
    label: {
      en: 'Other',
      fr: 'Autre'
    }
  }],

  getInitialState: function() {

    return {
      type: this.props.initType
    }

  },

  onChange: function( newType ) {

    this.setState( {
      type: newType
    });

  },

  componentDidUpdate: function() {

    this.props.onChange(this.state.type);

  },

  getSelectOptions: function() {

    var self = this;

    return this.types.map( function( m ) {

      return { 
        label: m.label[ self.props.lang ],
        value: m.code
      }

    });

  },

  render: function() {

    return (
      <ul className="cform">
        <li>
          <label for="type">{this.labels.label[ this.props.lang ]}</label>
          <div>
            <Select
              name="type"
              value={this.state.type}
              options={this.getSelectOptions()}
              clearable={false}
              onChange={this.onChange}
            />
          </div>
        </li>
      </ul>
    )

  }

});