"use strict";

const fs = require( 'fs' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const utils = require( '@openagenda/utils' );

const helpers = require( '../lib/mysqlHelpers' );

const dbConfig = utils.extend( {}, require( '../testconfig.js' ).mysql );

const { table, database } = dbConfig;

delete dbConfig.database; 

delete dbConfig.table;

describe( 'mysql helpers', () => {

  beforeEach( done => {

    const con = mysql.createConnection( dbConfig );

    con.query( `drop database if exists ${database}`, () => {

      con.end();

      done();

    });

  } );

  beforeEach( ( done ) => {

    let con = mysql.createConnection( dbConfig );

    con.query( `create database if not exists ${database}`, ( err ) => {

      con.end();

      con = mysql.createConnection( utils.extend( { database }, dbConfig ) );

      con.query( `create table if not exists ${table} ( id bigint auto_increment, uid bigint unique, other_id bigint, text longtext, primary key( id ) )`, ( err ) => {

        con.end();

        done();        

      } );

    } )

  } );


  it( 'update', done => {

    const con = mysql.createConnection( utils.extend( { database }, dbConfig ) );

    con.query( `insert into ${table} ( uid, other_id, text ) values ( ?, ?, ? )`, [ 123, 321, 'hueh hueh hueh' ], ( err, data ) => {

      helpers.update( con.query.bind( con ), table, { id: data.insertId }, { uid: 999, text: 'nih hi hi'}, err => {

        should( err ).equal( null );

        con.query( `select uid, text from ${table} where id=?`, data.insertId, ( err, rows ) => {

          rows[ 0 ].uid.should.equal( 999 );

          rows[ 0 ].text.should.equal( 'nih hi hi' );

          con.end();

          done();

        } );

      });

    } );

  } );

  it( 'insert', done => {

    const con = mysql.createConnection( utils.extend( { database }, dbConfig ) );

    helpers.insert( con.query.bind( con ), table, { uid: 282, text: 'bzzh' }, ( err, data ) => {

      should( err ).equal( null );

      con.query( `select * from ${table} where id = ?`, data.insertId, ( err, rows ) => {

        rows.length.should.equal( 1 );

        rows[ 0 ].uid.should.equal( 282 );

        rows[ 0 ].text.should.equal( 'bzzh' );

        done();

      } );

    } );

  } );

} );