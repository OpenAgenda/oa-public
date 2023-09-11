"use strict";

const _ = require( 'lodash' );
const pug = require( 'pug' );
const VError = require( '@openagenda/verror' );
const mark = require( './mark' );

module.exports = config => {

  const params = _.defaults( config, {
    basePath: false, // optional. If urls are to be generated
    templates: {},
    segments: [],
    pages: [],
    labels: false, // optional. If set, will look into keys for match
    throwOnUnknown: true
  } );

  // create the feature base renderers
  const renderers = params.segments.map( f => {

    return {
      key: f.key,
      defaults: f,
      render: pug.render.bind( null, params.templates[ f.template ] )
    }

  } );

  return page => {
    if ( !page ) {

      page = 'root';

    }

    let pageParams = params.pages.filter( _matchPageKey( page ) );

    if ( !pageParams.length ) {

      if ( params.throwOnUnknown ) throw new Error( 'unknown page ' + page );

      return null;

    }
    let lang = _pageLang( pageParams[ 0 ], page );
    return {
      render: render.bind( null, pageParams[ 0 ], lang ),
      getHeadPart: getHeadPart.bind( null, pageParams[ 0 ], lang ),
      getLang: () => lang,
      getAlternateUrl: getAlternateUrl.bind( null, pageParams[ 0 ] )
    }

  }

  function render( pageParams, lang = false, options = {} ) {

    let renderParams = _.defaults( options || {}, {
      lang
    } );

    let r = segments( pageParams, renderParams );

    if ( pageParams.layout ) {

      r = layout( pageParams, r, renderParams );

    }

    if ( params.basePath ) {

      r = _buildLinks( r, params, lang );

    }

    return r;

  }

  function getAlternateUrl( pageParams, lang ) {

    let item = pageParams.keys.filter( item => item.lang === lang )[ 0 ];

    return _getBasePath( params.basePath , lang ) + '/' + item.key;

  }

  function getHeadPart( pageParams, lang = false ) {

    let data = _reduceLabels( pageParams, lang, params.labels ),

    renderParts = [];

    if ( !data.head ) return '';

    Object.keys( data.head ).forEach( key => {

      if ( key === 'title' ) {

        renderParts.push( '<title>' + data.head[ key ] + '</title>' );

      }

      if ( [ 'title', 'description', 'keywords' ].indexOf( key ) !== -1 ) {

        renderParts.push( '<meta name="' + key + '" content="' + data.head[ key ] + '" />' );

      }

    } );

    if ( pageParams.keys ) {

      pageParams.keys.forEach( item => {

        if ( item.lang === lang ) return;

        renderParts.push( '<link rel="alternate" hreflang="' + item.lang + '" href="' + _getBasePath( params.basePath, lang ) + '/' + item.key + '" />' );

      } );

    }

    return renderParts.join( '\n' );

  }

  function layout( pageParams, content, renderParams ) {

    let data = _reduceLabels( pageParams, renderParams.lang, params.labels );

    const template = params.templates[ pageParams.layout ];

    const merged = _.assign( { content }, data, renderParams );

    try {

      return pug.render( template, merged );

    } catch ( e ) {

      throw new VError( 'Failed to render template \n%s\nwith data\n%j', template, merged, e );

    }

  }

  function segments( pageParams, renderParams ) {

    let rendered = '';

    pageParams.segments.forEach( d => {

      let s = _cleanPageSegment( d );

      let renderer = renderers.filter( r => r.key === s.key )[ 0 ],

      data = _.assign( {}, renderer.defaults, s );

      data = _reduceLabels( data, renderParams.lang, params.labels );

      try {

        rendered += renderer.render( data );

      } catch ( e ) {

        throw new Error( 'Invalid data with segment ' + s.key + ': ' + e );

      }

    } );

    return rendered;

  }

}


function _cleanPageSegment( segment ) {

  if ( typeof segment === 'string' ) {

    return {
      key: segment
    }

  }

  return segment;

}


function _reduceLabels( obj, lang, labels = false ) {

  if ( !_.isObject( obj ) ) return mark( obj );

  return _.mapValues( obj, o => {

    if ( _.isArray( o ) ) {

      return o.map( item => _reduceItem( item, lang, labels ) );

    }

    return _reduceItem( o, lang, labels );

  } );

}

function _reduceItem( item, lang, labels ) {

  if ( !_.isObject( item ) && labels && labels[ item ] !== undefined ) {

    return mark( labels[ item ][ lang ] );

  }

  if ( !_.isObject( item ) ) {

    return mark( item );

  }

  if ( item[ lang ] === undefined ) {

    return _reduceLabels( item, lang, labels );

  }

  return mark( item[ lang ] );

}

function _buildLinks( render, params, lang = false ) {

  let withLinks = render;

  params.pages.forEach( t => {

    let srcKeys = t.key ? [ t.key ] : [],

    destKey = t.key;

    if ( t.keys ) {

      srcKeys = srcKeys.concat( t.keys.map( t => t.key ) );

    }

    if ( lang && t.keys ) {
      destKey = t.keys.filter( k => k.lang === lang )[ 0 ].key;

    }

    let rgx = new RegExp( '\"#(' + srcKeys.join( '|' ) + ')\"', 'g' );

    withLinks = withLinks.replace( rgx, '"' + _getBasePath( params.basePath, lang ) + '/' + destKey + '"' );

  } );

  return withLinks;

}


function _matchPageKey( key ) {

  return p => {

    if ( p.keys ) {

      return !!p.keys.filter( k => k.key === key ).length;

    }

    return key === p.key;

  }

}


function _pageLang( params, key ) {

  if ( !params.keys ) return false;

  let match = params.keys.filter( k => k.key === key );

  if ( !match.length ) return false;

  return match[ 0 ].lang;

}


function _getBasePath( path, lang ) {

  if ( typeof path === 'string' ) return path;

  return path[ lang ];

}
