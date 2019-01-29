"use strict";

const sessions = require( '@openagenda/sessions' ),

  streamUtils = require( '@openagenda/stream-utils' ),

  flattener = require( '@openagenda/flattener' ),

  validator = require( 'validator' ),

  csv = require( 'fast-csv' ),

  xlsx = require( 'xlsx-writestream' ),

  getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/contributors/exportHeaders' ) ),

  getCredentialLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/contributors/credentials' ) ),

  getActionLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/actions' ) ),

  modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  agendaSvc = require( '../services/agenda' ),

  eventSvc = require( '../services/event' ),

  stakeholders = require( '@openagenda/agenda-stakeholders' ),

  usersSvc = require( '@openagenda/users' ),

  stakeholdersMw = require( '@openagenda/agenda-stakeholders/dist/middleware' ),

  routes = {

    stakeholdersCsvExport: [ 'get', '/contributors.csv', [
      cmn.checkAdminOrModerator,
      _loadFlattener,
      streamCsv
    ] ],

    stakeholdersXlsxExport: [ 'get', '/contributors.xlsx', [
      cmn.checkAdminOrModerator,
      _loadFlattener,
      streamXlsx
    ] ],

    contributorsInfo: [ 'get', '/contributors/info', [
      cmn.checkAdministrator(),
      agendaSvc.mw.loadAdminLayout,
      cmn.loadBaseData( 'oasfmain.css' ),
      info
    ] ],

    contributorsInfoSubmit: [ 'post', '/contributors/info', [
      cmn.checkAdministrator(),
      agendaSvc.mw.loadAdminLayout,
      cmn.loadBaseData(),
      infoSubmit
    ] ],

    eventTransfer: [ 'get', '/contributors/transfer/:eventSlug' , [
      eventSvc.mw.load( 'eventSlug', 'slug' ),
      _checkAdminOrModeratorOrEventOwner,
      cmn.checkCredential( 'eventTransfer' ),
      stakeholdersMw.agenda().load(),
      _loadUserByEmail,
      transfer
    ] ],

    stakeholderGet: [ 'get', '/contributors/:uid.json', [
      cmn.checkAdminOrModerator,
      _loadUserByUid,
      stakeholdersMw.agenda().get( { user: 'queriedUser' } ),
      ( req, res ) => {

        if ( !req.stakeholder ) {

          res.status(404).send( 'Not found' );

        } else {

          res.json( { name: req.queriedUser.fullName } );

        }

      }
    ] ]

  };

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function info( req, res ) {

  req.agenda.getContributionInfo( ( err, info ) => {

    cmn.render( req, res, 'contributors/info', {
      info
    } );

  });

}


function infoSubmit( req, res ) {

  req.agenda.setContributionInfo( req.body.info, true, function( err ) {

    if ( err ) return next( err );

    res.redirect( req.genUrl( 'contributorsInfo', { slug: req.agenda.slug } ) );

  } );

}

function _loadFlattener( req, res, next ) {

  req.flatten = flattener( [ {
    source: [ 'user.full_name', 'custom.contactName' ],
    transform: ( fullName, contactName ) => contactName || fullName,
    target: getLabel( 'name', req.lang )
  }, {
    source: 'credential',
    transform: _getCredentialLabel( req.lang ),
    target: getLabel( 'credential', req.lang )
  }, {
    source: 'custom.email',
    target: getLabel( 'email', req.lang )
  }, {
    source: 'custom.organization',
    target: getLabel( 'organization', req.lang )
  }, {
    source: 'custom.contactNumber',
    target: getLabel( 'phone', req.lang )
  }, {
    source: 'custom.contactPosition',
    target: getLabel( 'position', req.lang )
  }, {
    source: 'eventCount',
    target: getLabel( 'contributions', req.lang )
  } ] );

  next();

}


function _getCredentialLabel( lang ) {

  return c => [
    getCredentialLabel( 'contributor', lang ),
    getCredentialLabel( 'administrator', lang ),
    getCredentialLabel( 'moderator', lang )
  ][ c - 1 ];

}


function streamCsv( req, res ) {

  let listStream = streamUtils.read.list( stakeholders( req.agenda.id ).list, { detailed: true } ),

  transform = streamUtils.transform( req.flatten ),

  csvStream = csv.createWriteStream( {
    headers: true,
    delimiter: ';',
    quote: '"',
    escape: '"'
  } );

  listStream.pipe( transform ).pipe( csvStream ).pipe( res );

  res.writeHead( 200, {
    'Content-Type' : 'text/csv',
    'content-disposition' : `attachment; filename="contributors.${req.agenda.title}.csv"`
  } );

}


function streamXlsx( req, res, next ) {

  let listStream = streamUtils.read.list( stakeholders( req.agenda.id ).list, { detailed: true } ),

  transform = streamUtils.transform( req.flatten ),

  xlsxStream = new xlsx();

  xlsxStream.getReadStream().pipe( res );

  listStream.pipe( transform )

    .on( 'data', data => xlsxStream.addRow( data ) )

    .on( 'end', () => xlsxStream.finalize() );


  res.writeHead( 200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'content-disposition' : `attachment; filename="contributors.${req.agenda.title}.xlsx"`
  } );

}


async function _loadUserByEmail( req, res, next ) {

  if ( !req.query.email || !validator.isEmail( req.query.email ) ) {

    return next( {
      code: 400,
      message: 'email is wrong or missing'
    } );

  }

  try {

    const user = await usersSvc.findOne( {
      query: { email: req.query.email }
    } );

    if ( !user ) {
      return next( { code: 400, message: 'the target account does not exist' } );
    }

    req.stakeholder = user;

    next();

  } catch ( err ) {

    return next( err );

  }

}


async function _loadUserByUid( req, res, next ) {

  try {

    req.queriedUser = await usersSvc.get( req.params.uid );

    next();

  } catch ( err ) {

    return next( err );

  }

}


function transfer( req, res, next ) {

  req.stakeholders.transferEvent( {
    event: { id: req.event.id },
    user: { id: req.stakeholder.id }
  }, err => {

    if ( err ) return next( err );

    // force ES update
    req.event.onSave();

    sessions.setFlash( req, res, getActionLabel( 'ownershipTransfered', req.lang ) );

    res.redirect( 302, req.genUrl( 'agendaEventShow', {
      slug: req.agenda.slug,
      eventSlug: req.event.slug
    } ) );

  } );

}


function _checkAdminOrModeratorOrEventOwner( req, res, next ) {

  if ( req.event.ownerId === req.user.id ) {

    return next();

  }

  cmn.checkAdminOrModerator( req, res, result => {

    if ( result ) return next( result );

    req.event.getAdminAgendas( ( err, agendas ) => {

      let isAdminAgenda = !!agendas.map( a => a.uid ).filter( uid => uid === req.agenda.uid ).length;

      next( isAdminAgenda ? null : { code: 403 } );

    } );

  } );

}
