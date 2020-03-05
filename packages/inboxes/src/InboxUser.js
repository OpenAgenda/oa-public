import _ from 'lodash';
import VError from 'verror';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import logger from '@openagenda/logs';
import mapper from './utils/mapper';
import fieldsMap from './db/inboxUserFieldsMap';
import validate from './utils/validate';
import { getIdentifiersSchema, createSchema } from './validators/inboxUserSchemas';
import populateDetails from './db/populateDetails';

const log = logger( 'inboxes/InboxUser' );

const ajv = new Ajv( { allErrors: true, jsonPointers: true, errorDataPath: 'property' } );
ajvErrors( ajv );


export default class InboxUser {
  constructor( config, identifiers, options ) {
    if ( typeof identifiers === 'number' ) {
      identifiers = { id: identifiers };
    }

    this.config = config;
    this.identifiers = identifiers;
    this.inbox = options && options.inbox;
  }

  async create( data, options ) {
    const { knex, schemas } = this.config;

    await this._loadInbox();

    data = {
      ...data,
      inboxId: this.inbox.data.id
    };

    validate( ajv, createSchema, data );

    const inboxUser = await new InboxUser( this.config, data, { inbox: this.inbox } ).get( options );

    if ( inboxUser.data ) {
      this.identifiers = { ...this.identifiers, id: inboxUser.data.id };

      if ( inboxUser.data.leftAt ) {
        await knex( schemas.inboxUser )
          .update( 'left_at', null )
          .where( 'id', inboxUser.data.id );

        return this.get( options );
      }

      return inboxUser;
    }

    const [ insertedId ] = await knex( schemas.inboxUser )
      .insert( mapper.toDb( fieldsMap, 'insert', data, { protected: false } ) );

    this.identifiers = { id: insertedId };

    await this.get( options );

    log.info( 'InboxUser is created', { inboxUser: this.data } );

    return this;
  }

  async get( options ) {
    const { knex, schemas } = this.config;

    const params = _.merge( {
      detailed: false,
      createOnNull: false
    }, options );

    if ( this.inbox ) {
      await this._loadInbox();
    }

    const data = { ...this.identifiers };

    if ( this.inbox && this.inbox.data ) {
      data.inboxId = this.inbox.data.id;
    }

    validate( ajv, getIdentifiersSchema( this.identifiers ), data );

    const row = await knex( schemas.inboxUser )
      .first( mapper.listFields( fieldsMap, 'select', 'db', params ) )
      .where( mapper.toDb( fieldsMap, 'select', data, params ) );

    const result = mapper.toObj( fieldsMap, row, params );

    if ( !result && params.createOnNull ) {
      return this.create( this.identifiers );
    }

    this.data = do {
      if ( params.detailed && result ) {
        await populateDetails(
          this.config,
          {
            inboxUser: result,
            inboxUserId: result.id,
          },
          this.inbox );
      }
      result;
    };

    return this;
  }

  async remove() {
    const { knex, schemas } = this.config;

    await this.get();

    if ( !this.data ) {
      throw new VError( 'You can not remove a user inbox that does not exists: %j', this.identifiers );
    }

    const leftAt = new Date();

    await knex( schemas.inboxUser )
      .update( 'left_at', leftAt )
      .where( 'id', this.data.id );

    this.data.leftAt = leftAt;

    log.info( 'InboxUser removed', { inboxUser: this.data } );

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
