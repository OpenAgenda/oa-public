"use strict";

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import utils from 'utils';
import uniqueLoad from '../lib/uniqueLoad';
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
    lang: PropTypes.string,
    loadComponent: PropTypes.node
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
    lang: 'fr',
    loadComponent: null
  };

  constructor( props ) {

    super( props );

    utils.extend( this, {
      loadTinyMce: this.loadTinyMce.bind( this ),
      initializeTinyMceEditor: this.initializeTinyMceEditor.bind( this ),
      updateTinyMceEditor: this.updateTinyMceEditor.bind( this )
    } );

    this.state = {
      tinyMceReady: typeof tinymce !== 'undefined',
      editorId: null,
      uniqueClassName: this.props.uniqueClassName || 'js_' + generateUniqueIdentifier()
    }

    if ( !this.state.tinyMceReady ) this.loadTinyMce();

  }

  componentWillUnmount() {

    if ( !this.state.editorId ) return console.log( 'not loaded' );

    tinymce.get(this.state.editorId).remove();

  }

  render() {

    if ( !this.state.tinyMceReady ) return null;

    if ( !this.state.editorId ) {

      setTimeout( this.initializeTinyMceEditor )

    } else {

      setTimeout( this.updateTinyMceEditor );

    }


    if ( typeof document !== 'undefined' ) setTimeout( this.initializeTinyMce );

    const { className, placeholder, label, value } = this.props;

    return (
      <div className={className}>
        {label && <label>{label}</label>}
        <textarea
          placeholder={placeholder}
          className={this.state.uniqueClassName}
          value={ marked( value ) }
          style={{ minHeight: '200px', visibility: 'hidden' }}
          onChange={() => {
            
          }}
        >
        </textarea>
      </div>
    );

  }

  updateTinyMceEditor() {

    const editor = tinymce.get( this.state.editorId );

    if ( !editor ) return;

    if ( this.state.editorMarkdown !== this.props.value ) {

      // value in editor has diverged from value given in props. Needs to be updated
      tinymce.get( this.state.editorId ).setContent( marked( this.props.value ) );

    }    

  }

  initializeTinyMceEditor() {

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

        this.setState( {
          editorId: editor.id,
          editorMarkdown: this.props.value
        } );

        makeUrlConverter( editor );

        editor.on( 'change', e => {

          this.onTinyMCEChange( e.target.getContent() );

        } );

      },

      paste_postprocess: ( pl, o ) => {

        // paste from word-type processors insert a mess of tags
        // in the html; these must be cleaned
        o.node = cleanNode( o.node );

      }

    } );

  }

  onTinyMCEChange( html ) {

    const editorMarkdown = toMarkdown( html );

    this.setState( {
      editorMarkdown
    } );

    this.props.onChange( editorMarkdown );


  }

  loadTinyMce() {

    uniqueLoad( this.props.tinyMceUrl, ( err, script ) => {

      console.log( '?' );
      this.setState( {
        tinyMceReady: true
      } );

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