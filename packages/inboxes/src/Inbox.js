import _ from 'lodash';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import VError from 'verror';
import logger from '@openagenda/logs';
import mapper from './utils/mapper';
import fieldsMap from './db/inboxFieldsMap';
import validate from './utils/validate';
import { getIdentifiersSchema, createSchema } from './validators/inboxSchemas';
import InboxUsers from './InboxUsers';
import Conversations from './Conversations';

const log = logger( 'inboxes/Inbox' );

const ajv = new Ajv( { allErrors: true, jsonPointers: true, errorDataPath: 'property' } );
ajvErrors( ajv );


export default class Inbox {
  constructor( config, identifiers ) {
    if ( typeof identifiers === 'number' ) {
      identifiers = { id: identifiers };
    }

    this.config = config;
    this.identifiers = identifiers;
    this.users = new InboxUsers( config, { inbox: this } );
    this.conversations = new Conversations( config, { inbox: this } );
  }

  static user( config, userUid ) {
    return {
      conversations: new Conversations( config, {
        userUid,
        inbox: new Inbox( config, { type: 'user', identifier: userUid } )
      } )
    };
  }

  async create( data, options ) {
    const { knex, schemas, interfaces } = this.config;

    validate( ajv, createSchema, data );

    const inbox = await new Inbox( this.config, data )._get( options );
    if ( inbox.data ) {
      return inbox;
    }

    const [ insertedId ] = await knex( schemas.inbox )
      .insert( mapper.toDb( fieldsMap, 'insert', data, { protected: false } ) );

    this.identifiers = { id: insertedId };

    await this.get( options );

    log.info( 'Inbox is created', { inbox: this.data } );

    if ( interfaces.onInboxCreate ) {
      await interfaces.onInboxCreate( this );
    }

    return this;
  }

  async get( options ) {
    const params = _.merge( { createOnNull: true }, options );

    await this._get( params );

    if ( !this.data && this.identifiers.type && params.createOnNull ) {
      return this.create( this.identifiers, params );
    }

    return this;
  }

  async remove() {
    const { knex, schemas } = this.config;

    await this.get();

    if ( !this.data ) {
      throw new VError( 'You can not remove a inbox that does not exists: %j', this.identifiers );
    }

    await knex( schemas.inbox )
      .where( 'id', this.data.id );

    log.info( 'Inbox removed', { inbox: this.data } );

    this.data = null;

    return this;
  }

  async _get( options ) {
    const { knex, schemas } = this.config;

    validate( ajv, getIdentifiersSchema( this.identifiers ), this.identifiers );

    const data = await knex( schemas.inbox )
      .first( mapper.listFields( fieldsMap, 'select', 'db', options ) )
      .where( mapper.toDb( fieldsMap, 'select', this.identifiers, options ) );

    this.data = mapper.toObj( fieldsMap, data, options );

    return this;
  }

  toJSON() {
    if ( !this.data ) {
      return null;
    }

    return _.pick( this.data, mapper.listFields( fieldsMap, 'select', 'obj' ) );
  }
}
