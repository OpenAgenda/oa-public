"use strict";

var React = require( 'react' ),

marked = require( 'marked' ),

toMarkdown = require( 'to-markdown' ),

debug = require( 'debug' ),

utils = require( 'utils' ),

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

      var changed = self.props.markdown ? JSON.parse( JSON.stringify( self.props.markdown ) ) : {},

      errored = false; // opera

      try {

        changed[ l ] = toMarkdown( e.target.getContent() );

      } catch( e ) {

        errored = true;

      }

      if ( !errored ) self.props.onChange( changed );
      
    }

  },


  /**
   * ensure pasted content is cleaned up before
   * it is processed 
   */
  
  cleanNode: function( node ) {

    var clean = document.createElement( node.nodeName ),

    cleanChild, i, type, child, cleanType;

    for( var i = 0; i < node.childNodes.length; i++ ) {

      child = node.childNodes[ i ];

      type = child.nodeName.toLowerCase();

      cleanType = [ 'p', 'h1', 'h2', 'h3' ].indexOf( type ) !== -1 ? type : 'p';

      cleanChild = document.createElement( cleanType );

      cleanChild.innerHTML = this.flattenChildren( child );

      if ( cleanChild.innerHTML.length ) {

        clean.appendChild( cleanChild );

      }

    }

    return clean;

  },

  getCleanTextContent: function( elem ) {

    var attr = ( 'innerText' in elem ) ? 'innerText' : 'textContent';

    return utils.cleanString( elem[ attr ] || '' ).trim();

  },


  /**
   * because we don't deal with fancy in-depth html,
   * we prevent it from being pasted by using this
   */
  
  flattenChildren: function( node ) {

    var flattened = '';

    if ( !node.childNodes.length ) {

      return this.getCleanTextContent( node ); 

    }

    for( var i = 0; i< node.childNodes.length; i++ ) {

      if ( node.childNodes[ i ].childNodes.length ) {

        flattened += this.flattenChildren( node.childNodes[ i ] );

      } else {

        flattened += node.childNodes[ i ].nodeValue || '';

      }

    }

    return flattened;

  },

  render: function() {

    var self = this,

    count = this.props.languages.length,

    renderField = function( l, i ) {

      var value = self.props.markdown ? ( self.props.markdown[ l ] ? self.props.markdown[ l ] : '' ) : '';

      setTimeout( function() {

        tinymce.init({
          selector: '.mce-box-' + i,
          language: self.props.lang=='fr' ? 'fr_FR' : 'en_EN',
          menubar: false,
          plugins: 'autolink link lists print preview autoresize paste placeholder',
          toolbar: 'formatselect bold italic bullist link',
          statusbar: false,
          browser_spellcheck:true,
          block_formats: 'Paragraph=p;Header 2=h2;Header 3=h3;',
          autoresize_min_height: 100,
          // https://www.tinymce.com/docs/plugins/link/#link_title
          link_title: false,
          target_list: false,
          default_link_target: '_blank',
          link_assume_external_targets: false,
          invalid_elements: 'iframe',

          setup: function( editor ) {

            makeUrlConverter( editor );

            editor.on( 'change', self.onChange( l ) );

          },
          paste_postprocess : function(pl, o) {

            // paste from word-type processors insert a mess of tags
            // in the html; these must be cleaned
            o.node = self.cleanNode( o.node );

          }
        });

      });

      if ( count > 1 ) {

        return <li className="lang-unit">
          <label className="off32">{l}</label>
          <textarea className={'mce-box-' + i} value={ marked( value ) } placeholder={ self.props.placeholder[ self.props.lang ] }></textarea>
        </li>

      } else {

        return <textarea className={'mce-box-' + i} value={ marked( value ) } placeholder={ self.props.placeholder[ self.props.lang ] }></textarea>

      }

      

    };

    if ( count > 1 ) {

      return <ul>
        <li>
          <label>{ this.props.label[ this.props.lang ] }</label>
        </li>
        { this.props.languages.map( renderField ) }
      </ul>

    } else {

      return <ul>
        <li>
          <label>{ this.props.label[ this.props.lang ] }</label>
          { this.props.languages.map( renderField ) }
        </li>
      </ul>

    } 

    

  }

} );


function makeUrlConverter( editor ) {

  var fn = editor.convertURL;
  
  editor.convertURL = convertURL_;

  function convertURL_(url, name, elm){

    fn.apply(this, arguments);
    console.log(arguments);
    var regex = new RegExp("(http:|https:)?\/\/");
    if (!regex.test(url)) {
        return url = "http://" + url
    }
    return url;

  }

}