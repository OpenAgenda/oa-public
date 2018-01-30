import _ from 'lodash';
import VError from 'verror';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import logger from '@openagenda/logs';
import { knex, schemas, interfaces } from './config';
import mapper from './utils/mapper';
import messageFieldsMap from './db/messageFieldsMap';
import inboxUserFieldsMap from './db/inboxUserFieldsMap';
import inboxFieldsMap from './db/inboxFieldsMap';
import validate from './utils/validate';
import { identifiersSchema, createSchema } from './validators/messageSchemas';
import populateDetails from './db/populateDetails';

const log = logger( 'conversation/Message' );

const ajv = new Ajv( { allErrors: true, jsonPointers: true, errorDataPath: 'property' } );
ajvErrors( ajv );


export default class Message {
  constructor( identifiers, options ) {
    if ( typeof identifiers === 'number' ) {
      identifiers = { id: identifiers };
    }

    this.identifiers = identifiers;
    this.inbox = options.inbox;
    this.conversation = options.conversation;
    this.userUid = options && options.userUid;
  }

  async create( data, options ) {
    const params = _.merge( {
      createInboxUserOnNull: false
    }, options );

    await this._loadConversation();
    const inboxUser = this.conversation.data.inboxUser
      || (await this._getInboxUser( { userUid: this.userUid || data.userUid }, { createOnNull: params.createInboxUserOnNull } )).data;

    data = {
      ..._.pick( data, 'body' ),
      conversationId: this.conversation.data.id,
      inboxUserId: inboxUser.id
    };

    validate( ajv, createSchema, data );

    const [ insertedId ] = await knex( schemas.message )
      .insert( mapper.toDb( messageFieldsMap, 'insert', data, { protected: false } ) );

    this.identifiers = { id: insertedId };

    await this.get( options );

    log.info(
      'Message is created in conversation %d',
      this.conversation.data.id,
      { message: this.data, inboxUser }
    );

    if ( interfaces.onMessageCreate ) {
      await interfaces.onMessageCreate( this.conversation.data, this.data );
    }

    return this;
  }

  async get( options ) {
    await this._loadConversation();

    if ( !options || !options.latest ) {
      validate( ajv, identifiersSchema, this.identifiers );
    }

    const request = knex( schemas.message )
      .first()
      .column(
        mapper.listFields( messageFieldsMap, 'select', 'db', options, true )
          .map( v => `${schemas.message}.${v}` )
      )
      .column(
        mapper.listFields( inboxUserFieldsMap, 'select', 'db', options, true, 'inboxUser.' )
          .map( v => `${schemas.inboxUser}.${v}` )
      )
      .column(
        mapper.listFields( inboxFieldsMap, 'select', 'db', options, true, 'inbox.' )
          .map( v => `${schemas.inbox}.${v}` )
      )
      .leftJoin(
        schemas.inboxUser,
        `${schemas.inboxUser}.id`,
        `${schemas.message}.inbox_user_id`
      )
      .leftJoin(
        schemas.inbox,
        `${schemas.inbox}.id`,
        `${schemas.inboxUser}.inbox_id`
      )
      .where(
        _.mapKeys(
          mapper.toDb( messageFieldsMap, 'select', this.identifiers, options ),
          ( v, key ) => `${schemas.message}.${key}`
        )
      );

    if ( options && options.latest ) {
      request
        .where( `${schemas.message}.conversation_id`, this.conversation.data.id )
        .orderBy( 'created_at', 'desc' );
    }

    const row = await request;

    const result = _.reduce(
      { ...row, ...mapper.toObj( messageFieldsMap, row, options ) },
      ( result, value, key ) => _.set( result, key, value ),
      row ? {} : null
    );

    this.data = await populateDetails( result, this.inbox );

    return this;
  }

  async _loadConversation() {
    if ( !this.conversation.data ) {
      await this.conversation.get();
    }

    if ( !this.conversation.data ) {
      throw new VError( 'Conversation %j not found', this.conversation.identifiers );
    }
  }

  async _getInboxUser( identifiers, options ) {
    const inboxUser = await this.inbox.users.get( identifiers, options );
    // const inboxUser = await new InboxUser( identifiers, { inbox } ).get( { createOnNull } );

    if ( !inboxUser.data ) {
      throw new VError( 'InboxUser %j not found in Inbox %j', identifiers, this.inbox.identifiers );
    }

    return inboxUser;
  }

  toJSON() {
    if ( !this.data ) {
      return null;
    }

    return this.data
  }
}
