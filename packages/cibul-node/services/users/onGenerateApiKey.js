const config = require( '../../config' );

module.exports = async function onGenerateApiKey( user ) {

  // create/update legacy api_key_set entry

  const { knex, schemas } = config;

  const existingKeySet = await knex( schemas.apiKeySet ).select().first().where( { user_id: user.id } );

  if ( existingKeySet ) {

    await knex( schemas.apiKeySet )
      .where( { id: existingKeySet.id } )
      .update( {
        api_key: user.apiKey || null,
        api_secret: user.apiSecret || null
      } );

  } else {

    await knex( schemas.apiKeySet )
      .insert( {
        api_key: user.apiKey || null,
        api_secret: user.apiSecret || null,
        user_id: user.id,
        type: 1,
        created_at: new Date(),
        updated_at: new Date()
      } );

  }

};
