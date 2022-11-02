"use strict";

const _ = require( 'lodash' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const applyMask = require('./utils/applyMask');

schema.register( {
  text: validators.text,
  pass: validators.pass,
  number: validators.number
} );

const argsSchema = {
  query: {
    type: 'pass'
  },
  offset: {
    type: 'number'
  },
  limit: {
    type: 'number',
    max: 100
  },
  options: {
    type: 'pass'
  }
}


function parseListArguments(...args) {
  const objectAtFirst = typeof args[0] === 'object';
  const objectAtLast = typeof args[args.length - 1] === 'object';

  const query = objectAtFirst ? args[0] : {};
  const options = objectAtLast ? args[args.length - 1] : {};

  const [offset = 0, limit = 20] = args.slice(
    objectAtFirst ? 1 : 0,
    objectAtLast ? args.length - 1 : args.length
  );

  return { query, offset, limit, options };
}

module.exports = async function list( config, feedIdentifiers, ...restArgs ) {

  const { service, knex } = config;

  const args = parseListArguments(...restArgs);

  args.query = _.pick( args.query, [ 'actor', 'verb', 'object', 'target', 'createdAt' ] );

  const validateArgs = schema(argsSchema);

  let {
    query,
    offset: fromId,
    limit,
    options,
  } = validateArgs( args );

  const feed = feedIdentifiers
    ? await service.feed(feedIdentifiers).get({ internal: true })
    : undefined;

  const columnToSelect = [ 'id', 'actor', 'verb', 'object', 'target', 'store', 'created_at', 'updated_at' ]
    .reduce( ( prev, name ) => {
      prev.push( `${config.schemas.activity}.${name} as ${_.camelCase( name )}` );
      return prev;
    }, [] );

  const { createdAt } = query;
  query = _.pick( query, 'actor', 'verb', 'object', 'target' );

  const request = knex( config.schemas.activity ).column( columnToSelect )
    .where( query )
    .limit( limit );

  if ( fromId ) {
    request.where( 'id', '<', fromId );
  }

  if ( createdAt && createdAt.$lte ) {
    request.where( 'created_at', '<=', createdAt.$lte );
  }

  if ( createdAt && createdAt.$gte ) {
    request.where( 'created_at', '>=', createdAt.$gte );
  }

  if ( typeof createdAt === 'number' ) {
    request.where( 'created_at', '=', createdAt );
  }

  if (feed !== undefined) {
    request
      .select(config.schemas.feed_activity + '.mask')
      .join(
        config.schemas.feed_activity,
        config.schemas.feed_activity + '.activity_id',
        config.schemas.activity + '.id'
      )
      .where( config.schemas.feed_activity + '.feed_id', feed ? feed.id : 0 )
      .orderBy(config.schemas.activity + '.id', 'desc');
  } else {
    request.orderBy(config.schemas.activity + '.id', 'desc');
  }

  const rows = await request;

  return rows.map(activity => {
    activity.store = JSON.parse(activity.store);

    return applyMask(activity);
  });

};
