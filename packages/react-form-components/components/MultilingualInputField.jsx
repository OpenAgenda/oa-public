"use strict";

var React = require( 'react' ),

makeLabelGetter = require( '../lib/makeLabelGetter' ),

labels = require( '../labels' );

module.exports = React.createClass( {

  displayName: 'MultilingualInputField',

  propTypes: {
    
    // list of language codes to display
    languages: React.PropTypes.array,

    // language-indexed values. ex: { fr: 'v1', en: 'v2' }
    value: React.PropTypes.object,

    // used by component to load labels
    getLabel: React.PropTypes.func,
    
    // called when value changes
    onChange: React.PropTypes.func,

    // rows to display if field is textarea
    rows: React.PropTypes.number,

    // type of the field. either text or textarea
    type: React.PropTypes.string

  },

  getDefaultProps: function() {

    return {
      type: 'text',
      getLabel: makeLabelGetter( labels )
    }

  },

  onChange: function( lang ) {

    var self = this;

    return function( e ) {

      var newValue = JSON.parse( JSON.stringify( self.props.value ) );

      newValue[ lang ] = e.target.value;

      self.props.onChange( self.props.name, newValue );

    }

  },

  renderField: function( lang ) {

    var name = this.props.languages.length > 1 ? this.props.name + '_' + lang : this.props.name;

    if ( this.props.type == 'textarea' ) {

      return <textarea
        name={name}
        rows={this.props.rows}
        value={this.props.value[lang]}
        className="form-control"
        onChange={this.onChange( lang )} />

    } else {

      return <input
        name={name}
        type="text"
        value={this.props.value[lang]}
        className="form-control"
        onChange={this.onChange( lang )} />

    }

  },

  renderLanguageBlock: function( lang ) {

    if ( this.props.languages.length > 1 ) {

      return <div className="lang-unit">
        <label>{lang}</label>
        <div>
          {this.renderField( lang )}
        </div>
      </div>

    } else {

      return this.renderField( lang );

    }

  },

  render: function() {

    var self = this;

    return <div className="multilingual-input-field form-group">
      <label>{this.props.getLabel( this.props.name )}</label>
      <ul className="list-unstyled">
      {this.props.languages.map( function( lang ) {
        return <li key={lang}>
          {self.renderLanguageBlock( lang )}
        </li>
      } )}
        {this.props.info ? <li className="info">{this.props.info}</li> : null }
      </ul>
    </div>

  }

} );