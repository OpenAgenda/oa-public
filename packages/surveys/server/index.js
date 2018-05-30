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
  frontAppPath: '/dist/surveys/index.js',
  layout: () => 'no layout has been specified',
  validate: null
}

module.exports = {
  app,
  init,
  create,
  dist: express.static( __dirname + '/../client/dist' )
}

async function init( c ) {

  _.extend( serviceParams, c );
  
  serviceParams.render = _.template( fs.readFileSync( __dirname + '/canvas.ejs', 'utf-8' ), {
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

  let templateData = {
    config: {
      lang: _.get( req, 'lang', 'en' ),
      res: {
        redirect : '/'
      },
      schema: surveySchema
    }
  }

  if ( serviceParams.decorateKey ) {

    templateData = ih( templateData, _.get( req, serviceParams.decorateKey, {} ) );

  }

  templateData.config = JSON.stringify( templateData.config );

  const rendered = serviceParams.render( templateData );

  res.send( serviceParams.layout( req, rendered ) );

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

    clean = ih( clean, _.get( req, serviceParams.decorateKey, {} ) );

  }

  await create( clean );

  res.json( 200 );

} );
