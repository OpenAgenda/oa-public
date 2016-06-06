"use strict";

var React = require( 'react' ),

makeLabelGetter = require( '../lib/makeLabelGetter' ),

labels = require( '../labels' ),

utils = require( 'utils' );

module.exports = React.createClass( {

  displayName: 'MultilingualInputField',

  propTypes: {

    // enabled boolean
    enabled: React.PropTypes.array,
    
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
    type: React.PropTypes.string,

    // bottom is a component generator that takes a lang
    bottom: React.PropTypes.func

  },

  getDefaultProps() {

    return {
      type: 'text',
      getLabel: makeLabelGetter( labels ),
      enabled: {},
      bottom: () => null
    }

  },

  onChange( lang ) {

    return e => {

      var newValue = JSON.parse( JSON.stringify( this.props.value ) );

      newValue[ lang ] = e.target.value;

      this.props.onChange( this.props.name, newValue );

    }

  },

  renderField( lang ) {

    var name = this.props.languages.length > 1 ? this.props.name + '_' + lang : this.props.name;

    return <div>

    { this.props.type == 'textarea' ? <textarea
      name={name}
      rows={this.props.rows}
      value={this.props.value[lang]}
      className="form-control"
      onChange={this.onChange( lang )}
      disabled={!this.isEnabled( lang )} />

    : <input
        name={name}
        type="text"
        value={this.props.value[lang]}
        className="form-control"
        onChange={this.onChange( lang )} 
        disabled={!this.isEnabled( lang )} /> }

    { this.props.bottom( lang ) }

    </div>

  },

  isEnabled( lang ) {

    if ( !utils.isArray( this.props.enabled ) ) return true;

    return this.props.enabled.indexOf( lang ) !== -1;

  },

  renderLanguageBlock( lang ) {

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

  render() {

    return <div className="multilingual-input-field form-group">
      <label>{this.props.getLabel( this.props.name )}</label>
      <ul className="list-unstyled">
      {this.props.languages.map( lang => {
        return <li key={lang} className={this.isEnabled( lang ) ? '' : 'disabled'}>
          {this.renderLanguageBlock( lang )}
        </li>
      } )}
        {this.props.info ? <li className="info">{this.props.info}</li> : null }
      </ul>
    </div>

  }

} );