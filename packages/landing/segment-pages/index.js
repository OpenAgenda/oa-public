"use strict";

const _ = require( 'lodash' );
const pug = require( 'pug' );
const mark = require( './mark' );

module.exports = config => {

  const params = _.defaults( config, {
    basePath: false, // optional. If urls are to be generated
    templates: {},
    segments: [],
    pages: [],
    labels: false // optional. If set, will look into keys for match
  } );

  // create the feature base renderers
  const renderers = params.segments.map( f => {

    return {
      key: f.key,
      defaults: f,
      render: pug.render.bind( null, params.templates[ f.template ] )
    }

  } );

  return page => {

    let pageParams = params.pages.filter( t => t.key === page );

    if ( !pageParams.length ) {

      throw new Error( 'unknown page ' + page );

    }

    return {
      render: render.bind( null, pageParams[ 0 ] )
    }

  }

  function render( pageParams, options ) {

    let renderParams = _.defaults( options || {}, {
      lang: false
    } );

    let r = segments( pageParams, renderParams );

    if ( pageParams.layout ) {

      r = layout( pageParams, r, renderParams );

    }

    if ( params.basePath ) {

      r = _buildLinks( r, params );

    }

    return r;

  } 

  function layout( pageParams, content, renderParams ) {

    let data = _reduceLabels( pageParams, renderParams.lang, params.labels );

    return pug.render( params.templates[ pageParams.layout ], _.assign( { content }, data ) );

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

function _buildLinks( render, params ) {

  let withLinks = render;

  params.pages.forEach( t => {

    let rgx = new RegExp( '#' + t.key, 'g' );

    withLinks = withLinks.replace( rgx, params.basePath + '/' + t.key );

  } );

  return withLinks;

}