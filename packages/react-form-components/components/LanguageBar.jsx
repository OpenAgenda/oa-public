"use strict";

var React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

PropTypes = require( 'prop-types' ),

languages = require( 'languages' ),

Select = require( 'react-select' ),

labels = require( '../labels' ),

makeLabelGetter = require( '../lib/makeLabelGetter' );

module.exports = createReactClass( {

  displayName: 'LanguageBar',

  propTypes: {

    enabled: PropTypes.array,

    // if languages can be added removed or changed
    editable: PropTypes.bool,

    // used by component to load labels
    getLabel: PropTypes.func,

    // notify parent of new language selection
    onChange: PropTypes.func

  },

  getInitialState() {

    return {
      displaySelect: false,
      sortedLanguageCodes: this.sortLanguageCodes(),
      edited: false
    }

  },

  getDefaultProps() {

    return {
      editable: true,
      getLabel: makeLabelGetter( labels )
    }

  },

  onRemove( code ) {

    this.props.onChange( this.props.languages.filter( function( l ) {

      return l !== code;

    } ) );

  },

  isEnabled( lang ) {

    if ( !this.props.enabled  ) return true;

    return this.props.enabled.indexOf( lang ) !== -1;

  },

  sortLanguageCodes() {

    return languages.getAllLanguageCode().map( function( c ) { 

      return {
        code: c,
        label: languages.getLanguageInfo( c ).nativeName
      }

    }).sort( function( a, b ) {

      if (a.label < b.label ) return -1;

      if ( a.label > b.label ) return 1;

      return 0;

    }).map( function( a ) {

      return a.code;

    } );

  },

  getRemainingLanguages() {

    var self = this;

    return this.state.sortedLanguageCodes

    .filter( c => this.props.languages.indexOf( c ) == -1 )

    .map( function( c ) {

      return {
        value: c,
        label: languages.getLanguageInfo( c ).nativeName
      }

    } );

  },

  showSelect() {

    this.setState( {
      displaySelect: true
    } );

  },

  hideSelect() {

    this.setState( {
      displaySelect: false
    } );

  },

  languageAdd( newCode ) {

    var languages = this.props.languages.slice();

    languages.push( newCode.value );

    this.hideSelect();

    this.props.onChange( languages );

  },

  languageEdit( code ) {

    this.setState( { edited: code } );

  },

  languageChange( previousCode, newCode ) {

    var languages = this.props.languages.slice();

    languages.splice( languages.indexOf( previousCode ), 1, newCode );

    this.setState( { edited: false } );

    this.props.onChange( languages );

  },

  render() {

    let languageItem = l => {

      return <LanguageItem 
        enabled={this.isEnabled( l )}
        editable={this.props.editable}
        code={l}
        key={l}
        edited={l==this.state.edited}
        languages={this.props.languages}
        getRemainingLanguages={this.getRemainingLanguages}
        onRemove={this.onRemove}
        onChange={this.languageChange}
        onEdit={this.languageEdit.bind( null, l )} />

    };

    return (
      <div className="language-bar">
        <ul>
          {this.props.languages.map( l => { return languageItem( l ) } )}
        </ul>
        { this.props.editable ? <span className="language-add cform">
          { this.state.displaySelect ? <Select
          options={this.getRemainingLanguages()}
          onChange={this.languageAdd}
          clearable={false} /> : <a className="url" onClick={this.showSelect}>{this.props.getLabel( 'addLanguage' )}</a> }
        </span> : null }
        
      </div>
    );

  }

} );

var LanguageItem = createReactClass( {

  onRemove: function() {

    if ( !this.props.editable ) return;

    this.props.onRemove( this.props.code );

  },

  getDefaultProps() {

    return {
      enabled: true,
      editable: true
    }

  },

  renderCross() {

    return <span onClick={this.onRemove} className="remove">&#10005;</span>

  },

  onChange: function( code ) {

    this.props.onChange( this.props.code, code );

  },

  render: function() {

    let lInfo = languages.getLanguageInfo( this.props.code );

    if ( this.props.edited ) {

      return <li>
        <Select
          value={lInfo.nativeName}
          options={this.props.getRemainingLanguages()}
          onChange={this.onChange}
          clearable={false} />
      </li>

    } else {

      return <li className={this.props.enabled ? '' : 'disabled'}>
        <div className="language-item">
          <span onClick={this.props.onEdit}>{lInfo.nativeName}</span>
          { this.props.languages.length > 1 && this.props.editable ? this.renderCross() : null }
        </div>
      </li>

    }

    return <li>
      { this.props.edited ? 'edited' : 
      <span onClick={this.props.onEdit}>{lInfo.nativeName}</span> }
      
      { this.props.languages.length > 1 ? this.renderCross() : null }
    </li>;

  }

});