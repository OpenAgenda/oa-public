"use strict";

const _ = require( 'lodash' );
const express = require( 'express' );
const fs = require( 'fs' );


const app = express();
const bodyParser = require( 'body-parser' );
const ih = require( 'immutability-helper' );

const FormSchema = require( '@openagenda/form-schemas/iso/FormSchema' );

const surveySchema = require( './surveySchema' );

const serviceParams = {
  knex: null,
  schema: null,
  decorateKey: null,
  frontAppPath: '/assets/surveys/index.js',
  render: null,
  validate: null
}

module.exports = {
  app,
  init,
  create,
  assets: express.static( __dirname + '/../assets' )
}

async function init( c ) {

  _.extend( serviceParams, c );
  
  serviceParams.render = _.template( c.layout.replace( '<%- content %>', fs.readFileSync( __dirname + '/canvas.ejs', 'utf-8' ) ), {
    imports: _.pick( serviceParams, [ 'frontAppPath' ] )
  } );

  serviceParams.validate = ( new FormSchema( surveySchema ) ).getValidate();

  const exists = await serviceParams.knex.schema.hasTable( c.schema );

  if ( !exists ) {

    await serviceParams.knex.schema.createTable( c.schema, table => {
      table.increments();
      table.json( 'store' );
      table.timestamps();
    } );

  }

  // create db & table if doesn't exist

}

async function create( data ) {

  const createdAt = new Date;
  const updatedAt = new Date;
  const { knex, schema } = serviceParams;

  const [ insertId ] = await knex( schema ).insert( {
    store: JSON.stringify( data ),
    created_at: createdAt,
    updated_at: updatedAt
  } );

  return ih( data, { 
    id: { $set: insertId },
    createdAt,
    updatedAt
  } );

}

app.get( '/', ( req, res, next ) => {

  res.send( serviceParams.render({
    config: JSON.stringify( {
      lang: _.get( req, 'lang', 'en' ),
      res: {
        redirect : 'http://localhost:3000/redirected'
      },
      schema: surveySchema
    } )
  } ) );

} );

app.post( '/', bodyParser.json(), async ( req, res, next ) => {

  let clean;

  try {

    clean = serviceParams.validate( req.body );

  } catch ( e ) {

    return res.status( 400 ).json( {
      errors: e
    } );

  }

  if ( serviceParams.decorateKey ) {

    _.extend( clean, _.get( req, serviceParams.decorateKey, {} ) );

  }

  await create( clean );

  res.json( 200 );

} );
