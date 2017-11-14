import _ from 'lodash';
import VError from 'verror';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import { knex, schemas } from './config';
import mapper from './utils/mapper';
import fieldsMap from './db/inboxUserFieldsMap';
import validate from './utils/validate';
import { getIdentifiersSchema, createSchema } from './validators/inboxUserSchemas';

const ajv = new Ajv( { allErrors: true, jsonPointers: true, errorDataPath: 'property' } );
ajvErrors( ajv );


export default class InboxUser {
  constructor( identifiers, options ) {
    if ( typeof identifiers === 'number' ) {
      identifiers = { id: identifiers };
    }

    this.identifiers = identifiers;
    this.inbox = options && options.inbox;
  }

  async create( data, options ) {
    await this._loadInbox();

    data = {
      ...data,
      inboxId: this.inbox.data.id
    };

    validate( ajv, createSchema, data );

    const inboxUser = await new InboxUser( data, { inbox: this.inbox } ).get( options );
    if ( inboxUser.data ) {
      return inboxUser;
    }

    const [ insertedId ] = await knex( schemas.inboxUser )
      .insert( mapper.toDb( fieldsMap, 'insert', data, { protected: false } ) );

    this.identifiers = { id: insertedId };

    return this.get( options );
  }

  async get( options ) {
    if ( this.inbox ) {
      await this._loadInbox();
    }

    validate( ajv, getIdentifiersSchema( this.identifiers, this.inbox ), this.identifiers );

    const data = await knex( schemas.inboxUser )
      .first( mapper.listFields( fieldsMap, 'select', 'db', options ) )
      .where( mapper.toDb( fieldsMap, 'select', this.identifiers, options ) );

    this.data = mapper.toObj( fieldsMap, data, options );

    return this;
  }

  async remove() {
    await this.get();

    if ( !this.data ) {
      throw new VError( 'You can not remove a user inbox that does not exists: %j', this.identifiers );
    }

    const leftAt = new Date();

    await knex( schemas.inboxUser )
      .update( 'left_at', leftAt )
      .where( 'id', this.data.id );

    this.data.leftAt = leftAt;

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
    if ( !this.data ) {
      return null;
    }

    return this.data;
  }
}
