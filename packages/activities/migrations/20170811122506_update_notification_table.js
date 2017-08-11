const traverseTable = require( '../utils/traverseTable' );
const wn = require( 'when/node' );

exports.up = async knex => {

  const { schemas } = knex.client.config;

  await knex.schema.alterTable( schemas.feed_notification, t => {
    t.timestamp( 'updated_at' ).nullable().defaultTo( null );
  } );

  await wn.call(
    traverseTable,
    knex,
    schemas.feed_notification,
    q => q.whereNull( 'updated_at' ),
    ( item, i, cb ) => {

      console.log( `Update notification n°${item.id}: copy created_at in updated_at` );

      knex.raw( `UPDATE \`${schemas.feed_notification}\` SET updated_at = created_at WHERE id = ?`, [ item.id ] )
        .asCallback( cb );

    }
  );

};

exports.down = knex => {

  //

};
