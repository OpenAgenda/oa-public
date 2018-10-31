"use strict";

const _ = require( 'lodash' );
const axios = require( 'axios' );
const mdExtractor = require( 'markdown-link-extractor' );
const VError = require( 'verror' );

const logger = require( '@openagenda/logs' );
const log = logger( 'main' );

const cleanOptions = require( './validators/options' );
const cleanFromMarkdownOptions = require( './validators/fromMarkdownOptions' );

let oe = null; // service instance

class OEmbed {

  constructor( options ) {

    try {

      this.params = cleanOptions( options );

      this.params.filters = this.params.filters.map( f => new RegExp( f ) );

    } catch( errors ) {

      throw new Error( 'options are not valid', errors );

    }

  }

  async get( url ) {

    log( 'getting data for %s', url );

    const result = _.get( await axios.get( this.params.iframely.res, {
      params: { 
        api_key: this.params.iframely.key,
        url
      }
    } ), 'data' );

    log( 'retrieved data for %s', url );

    return result;

  }

  async fromMarkdown( md = '', options = {} ) {

    const cleanOptions = cleanFromMarkdownOptions( options );

    const urls = _.uniq( mdExtractor( md )
      .filter( link => !!this.params.filters.filter( 
        filter => filter.test( link ) 
      ).length
    ) );

    return ( await Promise.all( urls.map( async url => {

      let result = null;

      const matchingCurrent = _.first( cleanOptions.current.filter( c => c.link === url ) );

      if ( matchingCurrent ) return matchingCurrent;

      try {

        result = {
          link: url,
          data: await this.get( url )
        };

      } catch ( e ) {

        log( 'error', 'could not retrieve code for %s', url, e );

      }

      return result;

    } ) ) ).filter( r => !!r );

  }

}

module.exports = OEmbed;

module.exports.init = config => {

  if ( _.get( config, 'logger' ) ) {
    
    logger.setModuleConfig( _.get( config, 'logger' ) );

  }

  if ( _.get( config, 'options' ) ) {

    oe = new OEmbed( _.get( config, 'options' ) );

  }

}

module.exports.fromMarkdown = async ( text, options = {} ) => {

  if ( !oe ) throw new Error( 'Service is not initialized' );

  return oe.fromMarkdown( text, options );

}

module.exports.get = async url => {

  if ( !oe ) throw new Error( 'Service is not initialized' );

  return oe.get( url );

}
