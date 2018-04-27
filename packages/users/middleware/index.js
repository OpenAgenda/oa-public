"use strict";

const _ = require( 'lodash' );
const path = require( 'path' );
const w = require( 'when' );
const csurf = require( 'csurf' );
const log = require( '@openagenda/basic-logger' )( 'users - middleware' );
const mwUploadImage = require( '@openagenda/image-upload/lib/middleware' );
const images = require( '@openagenda/images' );
const files = require( '@openagenda/files' );
const service = require( '../' );

const csrf = csurf( { cookie: true } );

module.exports = {
  csrf,
  csrfProtection,
  load,
  getMe,
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
  requestChangeEmail,
  confirmChangeEmail,
  changePassword,
  generateApiKey,
  deleteAccount
};

function load( uidNamespace, toNamespace ) {

  return ( req, res, next ) => {

    service.get(
      { uid: _.get( req, uidNamespace ) },
      { fullImagePath: true, detailed: true },
      ( err, user ) => {

        if ( err ) return next( err );

        _.set( req, toNamespace, user );
        next();

      } );

  };

}


function getMe( req, res, next ) {

  if ( !req.xhr ) return next();

  service.get( { id: req.user.id, uid: req.user.uid }, { fullImagePath: true, detailed: true }, ( err, user ) => {

    if ( err ) return next( err );

    res.json( { user } );

  } );

}


function updateProfile( req, res, next ) {

  if ( !req.xhr ) return next();

  service.updateProfile( Object.assign( {}, req.query, { id: req.user.id, uid: req.user.uid } ), ( err, result ) => {

    if ( err ) return next( err );

    req.result = result;
    next();

  } );

}


function uploadProfileImage( req, res, next ) {

  service.get( { id: req.user.id, uid: req.user.uid }, ( err, user ) => {

    if ( err ) return next( err );

    mwUploadImage( {
      dest: '/var/tmp',
      handler: ( tmpPath, info, cb ) => {

        setProfileImage( {
          path: tmpPath,
          uid: user.uid
        }, ( err, imagePath ) => {
          service.set( Object.assign(
            { image: path.basename( imagePath ) },
            { id: req.user.id, uid: req.user.uid }
          ), ( err, result ) => {

            if ( err ) return next( err );

            cb( err, imagePath );

          } );
        } );

      }
    } )( req, res, next );

  } );

}


function removeProfileImage( req, res, next ) {

  service.get( { id: req.user.id, uid: req.user.uid }, ( err, user ) => {

    if ( err ) return next( err );

    service.set( Object.assign( { image: null }, { id: req.user.id, uid: req.user.uid } ), ( err, result ) => {

      if ( err ) return next( err );

      const images = getProfileImageFormats( 'profile' + user.uid );

      if ( user.image == images[ 0 ].name + '.jpg' ) {
        files.s3.remove( images.map( f => f.name + '.jpg' ), () => {
          res.send();
        } );
      } else {
        res.send();
      }

    } );

  } );

}


function requestChangeEmail( req, res, next ) {

  if ( !req.xhr ) return next();

  service.verifyPassword( {
    id: req.user.id,
    uid: req.user.uid,
    password: req.query.password
  }, ( err, goodPassword ) => {

    let query = Object.assign( {}, req.query, { id: req.user.id, uid: req.user.uid } ),

      v = service.validators.changeEmail( query );


    if ( !goodPassword ) {
      if ( !v.errors ) v.errors = [];

      v.errors.push( {
        field: 'password',
        code: 'password.badpassword',
        message: 'bad password'
      } );
      v.valid = false;
    }

    if ( v.errors && v.errors.length ) {
      v.success = false;
      return res.json( v );
    }

    service.requestChangeEmail( query, ( err, result ) => {

      if ( err ) return next( err );

      if ( result.errors && result.errors.length ) {
        result.success = false;
        delete result.token;
        return res.json( result );
      }

      req.result = result;

      next();

    } );

  } );

}


function confirmChangeEmail( options, req, res, next ) {

  const params = _.extend( {
    namespaces: {
      result: 'result'
    }
  }, options );

  service.confirmChangeEmail( req.query, ( err, success ) => {

    if ( err ) return next( err );

    req[ params.namespaces.result ] = {
      success: success
    }

    next();

  } );

}


function changePassword( req, res, next ) {

  if ( !req.xhr ) return next();

  service.verifyPassword( {
    id: req.user.id,
    uid: req.user.uid,
    password: req.query.old_password
  }, ( err, goodPassword ) => {

    let query = Object.assign( {}, req.query, { id: req.user.id, uid: req.user.uid } ),

      v = service.validators.changePassword( query );


    if ( !goodPassword ) {
      if ( !v.errors ) v.errors = [];

      v.errors.push( {
        field: 'old_password',
        code: 'password.badpassword',
        message: 'bad password'
      } );
      v.valid = false;
    }

    if ( req.query.new_password !== req.query.confirmation ) {
      if ( !v.errors ) v.errors = [];

      v.errors.push( {
        field: 'confirmation',
        code: 'confirmation.differentpassword',
        message: 'password different confirmation',
        origin: req.query.confirmation
      } );
      v.valid = false;
    }

    if ( v.errors && v.errors.length ) {
      v.success = false;
      return res.json( v );
    }

    service.changePassword( query, ( err, result ) => {

      if ( err ) return next( err );

      res.json( result );

    } );

  } );

}


function generateApiKey( req, res, next ) {

  if ( !req.xhr ) return next();

  service.get( { id: req.user.id, uid: req.user.uid }, { detailed: true }, ( err, user ) => {

    if ( err ) return next( err );

    if ( req.query.secret === '1' && !user.api_secret ) return next( 'Unauthorized' );

    service.generateApiKey( {
      id: req.user.id,
      uid: req.user.uid
    }, { secret: parseInt( req.query.secret ) === 1 }, ( err, result ) => {

      if ( err ) return next( err );

      res.json( result );

    } );

  } );

}

function deleteAccount( req, res, next ) {

  if ( !req.xhr ) return next();

  let query = Object.assign( {}, req.query, { id: req.user.id, uid: req.user.uid } );

  service.remove( query, ( err, success ) => {

    if ( err ) return next( err );

    if ( !success ) return res.status( 400 ).send();

    next();

  } );

}


function csrfProtection( req, res, next ) {

  csrf( req, res, err => {

    req.data = Object.assign( {}, req.data, { csrfToken: req.csrfToken() } );

    next( err || null );

  } );

}


function setProfileImage( params, cb ) {

  w( {
    url: params.url,
    path: params.path,
    name: 'profile' + params.uid,
    formattedPaths: [],
    uploadedPath: false // main image uploaded path
  } )

    .then( _format )

    .then( _upload )

    .done( v => cb( null, v.uploadedPath ), cb );

}


function _format( v ) {

  log( 'formatting source file %s', v.path || v.url );

  var d = w.defer();

  images.multi( {
    path: v.path,
    url: v.url
  }, getProfileImageFormats( v.name ), ( err, imagePaths ) => {

    if ( err ) return d.reject( err );

    log( 'saved formats at %s', imagePaths.join( ', ' ) );

    v.formattedPaths = imagePaths;

    d.resolve( v );

  } );

  return d.promise;

}


function _upload( v ) {

  var d = w.defer();

  files.s3.store( v.formattedPaths, ( err, urls ) => {

    if ( err ) return d.reject( err );

    v.uploadedPath = urls[ 0 ];

    d.resolve( v );

  } );

  return d.promise;

}


function getProfileImageFormats( name ) {

  return [ {
    name: name,
    format: {
      width: 300,
      crop: true
    }
  }, {
    name: name + '_o',
    format: {
      crop: true
    }
  }, {
    name: name + '_sm',
    format: {
      width: 150,
      crop: true
    }
  } ]

}
