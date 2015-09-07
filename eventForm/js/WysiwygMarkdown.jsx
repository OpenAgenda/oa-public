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

      var changed = JSON.parse( JSON.stringify( self.props.markdown ) );

      changed[ l ] = toMarkdown( e.target.getContent() );

      self.props.onChange( changed );

    }

  },

  render: function() {

    var self = this,

    count = this.props.languages.length,

    renderField = function( l, i ) {

      setTimeout( function() {

        tinymce.init({
          selector: '.mce-box-' + i,
          language: 'fr_FR',
          menubar: false,
          plugins: 'autolink link lists print preview autoresize',
          toolbar: 'formatselect bold italic link',
          statusbar: false,
          autoresize_min_height: 100,
          setup: function( editor ) {

            editor.on( 'change', self.onChange( l ) );

          }

        });

      });

      return <li className={count> 1 ? 'lang-unit' : '' }>
        {count>1?<label className="off32">{l}</label>:''}
        <textarea className={'mce-box-' + i}>{self.props.markdown[ l ] }</textarea>
      </li>

    };

    return <ul className="cform">
      <li><label>{this.props.labels.longDescription}</label></li>
      {this.props.languages.map(renderField)}
    </ul>

  }

} );