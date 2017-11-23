import _ from 'lodash';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import VError from 'verror';
import { knex, schemas } from './config';
import mapper from './utils/mapper';
import fieldsMap from './db/inboxFieldsMap';
import validate from './utils/validate';
import { getIdentifiersSchema, createSchema } from './validators/inboxSchemas';
import InboxUsers from './InboxUsers';
import Conversations from './Conversations';

const ajv = new Ajv( { allErrors: true, jsonPointers: true, errorDataPath: 'property' } );
ajvErrors( ajv );


export default class Inbox {
  constructor( identifiers ) {
    if ( typeof identifiers === 'number' ) {
      identifiers = { id: identifiers };
    }

    this.identifiers = identifiers;
    this.users = new InboxUsers( { inbox: this } );
    this.conversations = new Conversations( { inbox: this } );
  }

  static user( userUid ) {
    return {
      conversations: new Conversations( {
        userUid,
        inbox: new Inbox( { type: 'user', identifier: userUid } )
      } )
    };
  }

  async create( data, options ) {
    validate( ajv, createSchema, data );

    const inbox = await new Inbox( data )._get( options );
    if ( inbox.data ) {
      return inbox;
    }

    const [ insertedId ] = await knex( schemas.inbox )
      .insert( mapper.toDb( fieldsMap, 'insert', data, { protected: false } ) );

    this.identifiers = { id: insertedId };

    return this.get( options );
  }

  async get( options ) {
    await this._get( options );

    if ( !this.data && this.identifiers.type ) {
      return this.create( this.identifiers, options );
    }

    return this;
  }

  async remove() {
    await this.get();

    if ( !this.data ) {
      throw new VError( 'You can not remove a inbox that does not exists: %j', this.identifiers );
    }

    await knex( schemas.inbox )
      .where( 'id', this.data.id );

    this.data = null;

    return this;
  }

  async _get( options ) {
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
