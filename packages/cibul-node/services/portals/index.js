"use strict";

const _ = require( 'lodash' );
const axios = require( 'axios' );
const express = require( 'express' );
const qs = require( 'qs' );

const agendas = require( '@openagenda/agendas' );
const log = require( '@openagenda/logs' )( 'services/portals' );
const Portal = require( '@openagenda/agenda-portal' );

let p;

module.exports = parentApp => {

  parentApp.use( '/portals/assets', express.static( p.baseAssetsPath ) ),
  parentApp.use( '/portals/assets', express.static( __dirname + '/assets' ) ),

  parentApp.use( '/portals/:agendaUid', ( req, res, next ) => {
    res.locals.agendaUid = req.params.agendaUid;
    next();
  });

  parentApp.use( '/portals/:agendaUid', p.app );

}

module.exports.init = async config => {

  const proxy = {
    head: async agendaUid => _.pick( await agendas.get( { uid: agendaUid } ), [ 'uid', 'title', 'slug' ] ),
    list: list.bind( null, config.port ),
    get: get.bind( null, config.port )
  }

  p = await Portal( {
    root: agenda => `${config.root}/portals/${agenda.uid}`,
    assetsRoot: '/portals/assets',
    proxy,
    views: __dirname + '/views',
    sass: __dirname + '/sass/main.scss',
    assets: __dirname + '/assets',
    map: {
      tiles: {
        link: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      },
      center: {
        latitude: 43.597198,
        longitude: 1.441136
      },
      zoom: 12
    }
  } );

}


function list( port, agendaUid, query ) {

  const oaq = _.keys( query ).length ? query : {};

  const limit = 20;

  const offset = parseInt( _.get( query, 'offset',
    ( parseInt( _.get( query, 'page', 1 ) ) - 1 ) * limit
  ) );

  log( 'fetching', { oaq, offset, limit } );

  return axios
    .get( `http://localhost:${port}/agendas/${agendaUid}/events.json`, {
      params: { oaq, limit, offset },
      paramsSerializer: params => qs.stringify( params, { arrayFormat: 'brackets' } )
    } ).then( res => res.data );

}


function get( port, agendaUid, { uid, slug } ) {

  return axios
    .get( `http://localhost:${port}/agendas/${agendaUid}/events.json`, {
      params: {
        oaq: {
          passed: 1,
          ... uid ? { uids: [ uid ] } : {},
          ... slug ? { slug } : {}
        },
        limit: 1
      },
      paramsSerializer: params => qs.stringify( params, { arrayFormat: 'brackets' } )
    } ).then( res => _.get( res, 'data.events.0' ) );

}
