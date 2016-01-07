"use strict";

var React = require( 'react' ),

languages = require( 'languages' ),

Select = require( 'react-select' );

module.exports = React.createClass( {

  getInitialState: function() {

    return {
      displaySelect: false,
      sortedLanguageCodes: this.sortLanguageCodes()
    }

  },

  onRemove: function( code ) {

    this.props.onChange( this.props.languages.filter( function( l ) {

      return l !== code;

    } ) );

  },

  sortLanguageCodes: function() {

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

  getRemainingLanguages: function() {

    var self = this;

    return this.state.sortedLanguageCodes.filter( function( c ) {

      return self.props.languages.indexOf( c ) == -1;

    })

    .map( function( c ) {

      return {
        value: c,
        label: languages.getLanguageInfo( c ).nativeName
      }

    } );

  },

  showSelect: function() {

    this.setState( { displaySelect: true } );

  },

  hideSelect: function() {

    this.setState( { displaySelect: false } );

  },

  languageAdd: function( newCode ) {

    var languages = this.props.languages.slice();

    languages.push( newCode );

    this.hideSelect();

    this.props.onChange( languages );

  },

  render: function() {

    var self = this,

    languageItem = function( l ) {

      return <LanguageItem 
        code={l}
        languages={self.props.languages}
        onRemove={self.onRemove} />

    };

    return (
      <div className="language-bar">
        <ul>
          {this.props.languages.map( languageItem )}
        </ul>
        <span className="language-add cform">
          { this.state.displaySelect ? <Select
          options={this.getRemainingLanguages()}
          onChange={this.languageAdd}
          clearable={false} /> : <a className="url" onClick={this.showSelect}>{this.props.getLabel( 'addLanguage' )}</a> }
        </span>
        
      </div>
    );

  }

} );

var LanguageItem = React.createClass( {

  onRemove: function() {

    this.props.onRemove( this.props.code );

  },

  render: function() {

    var self = this,

    lInfo = languages.getLanguageInfo( this.props.code ),

    removeCross = function() {

      return <span onClick={self.onRemove} className="remove">&#10005;</span>

    }

    return <li>
      <span>{lInfo.nativeName}</span>
      
      { this.props.languages.length > 1 ? removeCross() : null }
    </li>;

  }

});