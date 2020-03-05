import _ from 'lodash';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import parseListArguments from '@openagenda/service-utils/parseListArguments';
import InboxUser from './InboxUser';
import mapper from './utils/mapper';
import inboxUserFieldsMap from './db/inboxUserFieldsMap';
import { knex, schemas } from './config';
import { getListSchema } from './validators/inboxUserSchemas';
import validate from './utils/validate';

const ajv = new Ajv( { allErrors: true, jsonPointers: true, errorDataPath: 'property' } );
ajvErrors( ajv );

export default class InboxUsers {
  constructor( config, options ) {
    this.config = config;
    this.inbox = options && options.inbox;
  }

  add( data, options ) {
    return new InboxUser( this.config, null, { inbox: this.inbox } ).create( data, options );
  }

  get( identifiers, options ) {
    return new InboxUser( this.config, identifiers, { inbox: this.inbox } ).get( options );
  }

  remove( identifiers ) {
    return new InboxUser( this.config, identifiers, { inbox: this.inbox } ).remove();
  }

  async list( ...args ) {
    const { knex, schemas } = this.config;

    if ( this.inbox ) {
      await this._loadInbox();
    }

    const { query, offset, limit, options } = parseListArguments( ...args );

    const data = _.omit( query, [ 'leftAt' ] );

    if ( this.inbox && this.inbox.data ) {
      data.inboxId = this.inbox.data.id;
    }

    validate( ajv, getListSchema( data ), data );

    const request = knex( schemas.inboxUser )
      .select()
      .column(
        mapper.listFields( inboxUserFieldsMap, 'select', 'db', options, true )
          .map( v => `${schemas.inboxUser}.${v}` )
      )
      .where(
        _.mapKeys(
          mapper.toDb( inboxUserFieldsMap, 'select', _.omit( data, 'inboxId' ), options ),
          ( v, key ) => `${schemas.inboxUser}.${key}`
        )
      )
      .offset( offset )
      .limit( limit );

    if ( data.inboxId ) {
      request.whereIn( `${schemas.inboxUser}.inbox_id`, [].concat( data.inboxId ) );
    }

    if ( query.leftAt === true ) {
      request.whereNotNull( `${schemas.inboxUser}.left_at` );
    } else if ( query.leftAt === false ) {
      request.whereNull( `${schemas.inboxUser}.left_at` );
    }

    const rows = await request;

    const result = rows.map( row =>
      _.reduce(
        { ...row, ...mapper.toObj( inboxUserFieldsMap, row, options ) },
        ( result, value, key ) => _.set( result, key, value ),
        {}
      )
    );

    this.data = result;

    return this;
  }

  async _loadInbox() {
    if ( !this.inbox.data ) {
      await this.inbox.get();
    }

    if ( !this.inbox.data ) {
      throw new VError( 'Inbox %j not found', this.inbox.identifiers );
    }
  }

  toJSON() {
    return this.data || null;
  }
}
