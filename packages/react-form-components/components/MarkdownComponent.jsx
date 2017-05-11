"use strict";

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import utils from 'utils';
import load from 'load-script';
import toMarkdown from 'to-markdown';
import marked from 'marked';

export default class MarkdownComponent extends Component {

  static propTypes = {
    tinymceUrl: PropTypes.string,
    className: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    tinyMceOptions: PropTypes.object,
    uniqueClassName: PropTypes.string,
    lang: PropTypes.string
  };

  static defaultProps = {
    className: 'form-group',
    value: '',
    tinyMceUrl: '/js/tinymce/tinymce.min.js',
    label: null,
    placeholder: null,
    onChange: () => {
    },
    uniqueClassName: null,
    lang: 'fr'
  };

  constructor( props ) {

    super( props );

    utils.extend( this, {
      loadTinyMce: this.loadTinyMce.bind( this ),
      initializeTinyMce: this.initializeTinyMce.bind( this )
    } );

    this.state = {
      tinyMceIsLoaded: false,
      uniqueClassName: this.props.uniqueClassName || 'js_' + generateUniqueIdentifier()
    }

    if ( typeof document !== 'undefined' ) this.loadTinyMce();

  }

  render() {

    if ( !this.state.tinyMceIsLoaded ) return null;

    if ( typeof document !== 'undefined' ) setTimeout( this.initializeTinyMce );

    const { className, label, placeholder, value } = this.props;

    return (
      <div className={className}>
        { label && <label>{label}</label> }
        <textarea
          placeholder={placeholder}
          className={this.state.uniqueClassName}
          value={ marked( value ) }
          onChange={() => {
          }}
        >
        </textarea>
      </div>
    );

  }

  initializeTinyMce() {

    tinymce.init( {
      selector: '.' + this.state.uniqueClassName,
      language: this.props.lang == 'fr' ? 'fr_FR' : 'en_EN',
      menubar: false,
      plugins: 'autolink link lists print preview autoresize paste placeholder',
      toolbar: 'formatselect bold italic bullist link',
      statusbar: false,
      browser_spellcheck: true,
      block_formats: 'Paragraph=p;Header 2=h2;Header 3=h3;',
      autoresize_min_height: 100,
      // https://www.tinymce.com/docs/plugins/link/#link_title
      link_title: false,
      target_list: false,
      default_link_target: '_blank',
      link_assume_external_targets: false,
      // pasted iframe are not converted in editor
      invalid_elements: 'iframe',

      setup: editor => {

        makeUrlConverter( editor );

        editor.on( 'change', e => {

          this.props.onChange( toMarkdown( e.target.getContent() ) );

        } );

      },

      paste_postprocess: ( pl, o ) => {

        // paste from word-type processors insert a mess of tags
        // in the html; these must be cleaned
        o.node = cleanNode( o.node );

      }

    } );

  }

  loadTinyMce() {

    load( this.props.tinyMceUrl, ( err, script ) => {

      this.setState( { tinyMceIsLoaded: true } );

    } );

  }

}


function generateUniqueIdentifier() {

  return Math.ceil( Math.random() * 100000000 );

}


function flattenChildren( node ) {

  var flattened = '';

  if ( !node.childNodes.length ) {

    return getCleanTextContent( node );

  }

  for ( var i = 0; i < node.childNodes.length; i++ ) {

    if ( node.childNodes[ i ].childNodes.length ) {

      flattened += flattenChildren( node.childNodes[ i ] );

    } else {

      flattened += node.childNodes[ i ].nodeValue || '';

    }

  }

  return flattened;

}


function cleanNode( node ) {

  let clean = document.createElement( node.nodeName ),

    cleanChild, i, type, child, cleanType;

  for ( i = 0; i < node.childNodes.length; i++ ) {

    child = node.childNodes[ i ];

    type = child.nodeName.toLowerCase();

    cleanType = [ 'p', 'h1', 'h2', 'h3' ].indexOf( type ) !== -1 ? type : 'p';

    cleanChild = document.createElement( cleanType );

    cleanChild.innerHTML = flattenChildren( child );

    if ( cleanChild.innerHTML.length ) {

      clean.appendChild( cleanChild );

    }

  }

  return clean;

}


function makeUrlConverter( editor ) {

  var fn = editor.convertURL;

  editor.convertURL = convertURL_;

  function convertURL_( url, name, elm ) {

    fn.apply( this, arguments );

    var regex = new RegExp( "(http:|https:)?\/\/" );
    if ( !regex.test( url ) ) {
      return url = "http://" + url
    }
    return url;

  }

}


function getCleanTextContent( elem ) {

  let attr = ( 'innerText' in elem ) ? 'innerText' : 'textContent';

  return utils.cleanString( elem[ attr ] || '' ).trim();

}