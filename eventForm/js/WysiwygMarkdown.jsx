"use strict";

var React = require( 'react' ),

marked = require( 'marked' ),

toMarkdown = require( 'to-markdown' ),

debug = require( 'debug' ),

log = debug( 'wysiwyg' ),

changeDelay = 3000, tm; // refreshing the component is expensive

module.exports = React.createClass( {

  getInitialState: function() {

    return {
      isTyping: false
    }

  },

  onChange: function( l ) {

    var self = this;

    return function( e ) {

      var changed = self.props.markdown ? JSON.parse( JSON.stringify( self.props.markdown ) ) : {};

      changed[ l ] = toMarkdown( e.target.getContent() );

      self.props.onChange( changed );

    }

  },

  render: function() {

    var self = this,

    count = this.props.languages.length,

    renderField = function( l, i ) {

      var value = self.props.markdown ? ( self.props.markdown[ l ] ? self.props.markdown[ l ] : '' ) : '';

      setTimeout( function() {

        tinymce.init({
          selector: '.mce-box-' + i,
          language: 'fr_FR',
          menubar: false,
          plugins: 'autolink link lists print preview autoresize',
          toolbar: 'formatselect bold italic underline bullist link',
          statusbar: false,
          block_formats: 'Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;',
          autoresize_min_height: 100,
          setup: function( editor ) {

            editor.on( 'change', self.onChange( l ) );

          }

        });

      });

      if ( count > 1 ) {

        return <li className="lang-unit">
          <label className="off32">{l}</label>
          <textarea className={'mce-box-' + i} value={ marked( value ) }></textarea>
        </li>

      } else {

        return <textarea className={'mce-box-' + i} value={ marked( value ) }></textarea>

      }

      

    };

    if ( count > 1 ) {

      return <ul className="cform">
        <li>
          <label>{this.props.labels.longDescription[this.props.lang]}</label>
        </li>
        {this.props.languages.map(renderField)}
      </ul>

    } else {

      return <ul className="cform">
        <li>
          <label>{this.props.labels.longDescription[this.props.lang]}</label>
          {this.props.languages.map(renderField)}
        </li>
      </ul>

    } 

    

  }

} );