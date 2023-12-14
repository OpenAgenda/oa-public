"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const mysql = require( 'mysql' );

const schema = require( '@openagenda/validators/schema' );

const svc = require( './service' );

const config = require( '../testconfig' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  text: require( '@openagenda/validators/text' )
} );

describe( 'extended events - functional (server): update', function() {

  describe( 'basics', () => {

    let result;

    beforeAll( async () => {
      await svc.initAndLoad( ih( config, {
        interfaces: {
          getValidator: {
            $set: formSchemaId => schema( {
              edition: {
                type: 'integer'
              },
              contender: {
                type: 'text'
              }
            } )
          }
        }
      } ) );
    } );

    beforeAll(async () => {
      await svc( 3819893 ).create( 123, {
        edition: 12,
        contender: 'steve'
      } );

      result = await svc( 3819893 ).update( 123, {
        edition: 13,
        contender: 'bob'
      } );
    });

    it('success key is true if update is successful', () => {
      expect(result.success).toBe(true);
    });

    it('record in db is updated', done => {
      const con = mysql.createConnection( config.mysql );

      con.query(
        `select * from ${config.schemas.custom} where form_schema_id = ? and identifier = ?`,
        [3819893, 123],
        ( err, rows ) => {
          con.end();
          expect(rows.length).toBe(1);
          expect(
            JSON.parse(rows[0].store).contender,
          ).toBe('bob');
          done();
      });
    });

    it('before key contains values before update', () => {
      expect(result.before).toEqual({
        edition: 12,
        contender: 'steve'
      });
    });

  });

  describe('partial', () => {

    beforeAll( async () => {
      await svc.initAndLoad( ih( config, {
        interfaces: {
          getValidator: {
            $set: formSchemaId => schema( {
              edition: {
                type: 'integer'
              },
              contender: {
                type: 'text'
              }
            } )
          }
        }
      } ) );
    } );

    it('partial update only updates provided fields', async () => {

      await svc( 3819893 ).create( 7666, {
        edition: 22,
        contender: 'Stanislas'
      } );

      const result = await svc(3819893).update(7666, {
        contender: 'Boris'
      }, { partial: true } );

      expect(result).toEqual({
        success: true,
        before: {
          edition: 22,
          contender: 'Stanislas'
        },
        custom: {
          edition: 22,
          contender: 'Boris'
        }
      });

    });

  });

} );
