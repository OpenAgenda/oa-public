const uuid = require( 'uuid/v4' );

exports.up = async knex => {

  const { schemas } = knex.client.config;

  await knex.schema.alterTable( schemas.conversation, t => {
    t.string( 'file_key' ).notNullable();
  } );

  let convs;
  let offset = 0;
  const limit = 100;

  while ( convs = await knex( schemas.conversation ).select().where( { file_key: '' } ) ) {
    if ( !convs.length ) break;

    for ( const conv of convs ) {
      await knex( schemas.conversation )
        .where( { id: conv.id } )
        .update( { file_key: uuid().replace( /\-/g, '' ) } );
    }

    offset += limit;
  }

  await knex.schema.alterTable( schemas.conversation, t => {
    t.string( 'file_key' ).unique().alter();
  } );
};

exports.down = async knex => {

  const { schemas } = knex.client.config;

  await knex.schema.alterTable( schemas.conversation, t => {
    t.dropColumn( 'file_key' );
  } );

};
