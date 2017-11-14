import _ from 'lodash';
import VError from 'verror';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import ajvKeywords from 'ajv-keywords';
import logger from '@openagenda/logs';
import { knex, schemas, types, interfaces } from './config';
import mapper from './utils/mapper';
import conversationFieldsMap from './db/conversationFieldsMap';
import validate from './utils/validate';
import { identifiersSchema, createSchema, updateSchema } from './validators/conversationSchemas';
import Inbox from './Inbox';
import Messages from './Messages';
import populateParticipants from './db/populateParticipants';
import populateLatestMessage from './db/populateLatestMessage';

const log = logger( 'inboxes/Conversation' );

const ajv = new Ajv( { allErrors: true, jsonPointers: true, errorDataPath: 'property' } );
ajvErrors( ajv );
ajvKeywords( ajv, [ 'instanceof' ] );

export default class Conversation {
  constructor( identifiers, options ) {
    if ( typeof identifiers === 'number' ) {
      identifiers = { id: identifiers };
    }

    this.identifiers = identifiers;
    this.inbox = options && options.inbox;
    this.userUid = options && options.userUid;
    this.messages = new Messages( { conversation: this, inbox: this.inbox, userUid: this.userUid } );
  }

  async create( data, options ) {
    await this._loadInbox();
    const inboxUser = await this._getInboxUser( this.userUid ? { userUid: this.userUid } : data.creatorInboxUser );

    if ( !inboxUser.data ) {
      throw new VError( 'Inbox user %j not found', inboxUser.identifiers );
    }

    const destinationInbox = await new Inbox( data.destinationInbox ).get();

    if ( !destinationInbox.data ) {
      throw new VError( 'Destination Inbox %j not found', destinationInbox.identifiers );
    }

    validate( ajv, createSchema, _.omit( data, 'destinationInbox', 'creatorInboxUser' ) );

    if ( !types || !types[ data.type ] ) {
      throw new VError( 'Unknow conversation type %s', data.type );
    }

    const protectedData = {
      store: { params: data.params || {} },
      ..._.pick( data, 'type', 'typeIdentifier' )
    };

    data = _.omit( data, 'params', 'destinationInbox', 'creatorInboxUser' );

    const [ insertedId ] = await knex( schemas.conversation )
      .insert( {
        ...mapper.toDb( conversationFieldsMap, 'insert', data, options ),
        ...mapper.toDb( conversationFieldsMap, 'insert', protectedData, { protected: false } ),
        creator_inbox_user_id: inboxUser.data.id
      } );

    this.identifiers = { id: insertedId };

    await knex( schemas.inboxConversation ).insert( {
      inbox_id: destinationInbox.data.id,
      conversation_id: this.identifiers.id
    } );

    await knex( schemas.inboxConversation ).insert( {
      inbox_id: this.inbox.data.id,
      conversation_id: this.identifiers.id
    } );

    if ( data.message ) {
      await this.messages.create( {
        body: data.message,
        userUid: inboxUser.data.userUid
      } );
    }

    return this.get( options );
  }

  async get( options ) {
    await this._loadInbox();

    validate( ajv, identifiersSchema, this.identifiers );

    const row = await knex( schemas.conversation )
      .first()
      .column(
        mapper.listFields( conversationFieldsMap, 'select', 'db', options, true )
          .map( v => `${schemas.conversation}.${v}` )
      )
      .column( `${schemas.inbox}.id as inboxContextId` )
      .max( `${schemas.message}.id as latestMessageId` )
      .leftJoin(
        schemas.inboxConversation,
        `${schemas.conversation}.id`,
        `${schemas.inboxConversation}.conversation_id`
      )
      .leftJoin(
        schemas.inbox,
        `${schemas.inbox}.id`,
        `${schemas.inboxConversation}.inbox_id`
      )
      .leftJoin(
        schemas.message,
        `${schemas.message}.conversation_id`,
        `${schemas.conversation}.id`
      )
      .where(
        _.mapKeys(
          mapper.toDb( conversationFieldsMap, 'select', this.identifiers, options ),
          ( v, key ) => `${schemas.conversation}.${key}`
        )
      )
      .andWhere( `${schemas.inboxConversation}.inbox_id`, this.inbox.data.id )
      .groupBy( `${schemas.conversation}.id` )
      .orderByRaw( '(resolvedAt IS NOT NULL)' )
      .orderByRaw( 'latestMessageId DESC' )
      .orderByRaw( `GREATEST( ${schemas.conversation}.created_at, ${schemas.conversation}.updated_at ) DESC` );

    if ( !row ) {
      this.data = null;
      return this;
    }

    let result = _.reduce(
      { ...row, ...mapper.toObj( conversationFieldsMap, row, options ) },
      ( result, value, key ) => _.set( result, key, value ),
      row
    );

    result = await populateLatestMessage( result, this.inbox );

    result = await populateParticipants( result );

    if ( !result.resolvedAt ) {
      const creatorInboxId = (await this._getInboxUser( result.creatorInboxUserId )).data.inboxId;

      const fromOrTo = creatorInboxId === this.inbox.data.id ? 'from' : 'to';
      const actions = _.get( types, [ result.type, 'actions', fromOrTo ] );

      result.actions = actions || null;
    } else {
      result.actions = null;
    }

    this.data = result;

    return this;
  }

  async update( data, options ) {
    await this._loadConversation();

    if ( data.resolvedAt ) {
      data.resolvedAt = new Date( data.resolvedAt );
    }

    validate( ajv, updateSchema, data );

    data = {
      ..._.omit( data, 'params' ),
      store: {
        ...this.data.store,
        params: data.params || {}
      }
    };

    await knex( schemas.conversation )
      .update( {
        ...mapper.toDb( conversationFieldsMap, 'update', data, options ),
        updated_at: new Date()
      } )
      .leftJoin(
        schemas.inboxConversation,
        `${schemas.conversation}.id`,
        `${schemas.inboxConversation}.conversation_id`
      )
      .where(
        _.mapKeys(
          mapper.toDb( conversationFieldsMap, 'select', this.identifiers, options ),
          ( v, key ) => `${schemas.conversation}.${key}`
        )
      )
      .andWhere( `${schemas.inboxConversation}.inbox_id`, this.inbox.data.id );

    return this.get();
  }

  async action( code, inboxUser ) {
    await this._loadConversation();

    const _inboxUser = await this._getInboxUser( this.userUid ? { userUid: this.userUid } : inboxUser );
    const creatorInboxId = (await this._getInboxUser( this.data.creatorInboxUserId )).data.inboxId;

    if ( !_inboxUser.data ) {
      throw new VError( 'Inbox user %j not found', _inboxUser.identifiers );
    }

    const fromOrTo = creatorInboxId === this.inbox.data.id ? 'from' : 'to';
    const actions = _.get( types, [ this.data.type, 'actions', fromOrTo ] ) || [];
    const action = actions.find( v => v && v.code === code );

    if ( !action ) {
      throw new VError(
        'This action (%s) doesn\'t exist for a conversation of type %s (%j)',
        code,
        this.data.type,
        this.identifiers
      );
    }

    const data = {
      store: {
        ...this.data.store,
        resolvedWith: code,
        resolvedBy: {
          inboxUserId: _inboxUser.data.id,
          userUid: _inboxUser.data.userUid
        }
      }
    };

    await knex( schemas.conversation )
      .update( {
        ...mapper.toDb( conversationFieldsMap, 'update', data, { protected: false } ),
        updated_at: new Date(),
        resolved_at: new Date()
      } )
      .leftJoin(
        schemas.inboxConversation,
        `${schemas.conversation}.id`,
        `${schemas.inboxConversation}.conversation_id`
      )
      .where(
        _.mapKeys(
          mapper.toDb( conversationFieldsMap, 'select', this.identifiers ),
          ( v, key ) => `${schemas.conversation}.${key}`
        )
      )
      .andWhere( `${schemas.inboxConversation}.inbox_id`, this.inbox.data.id );

    try {
      await interfaces.onAction( this.data, action );
    } catch ( e ) {
      log.error( new VError( {
          cause: e,
          info: { conversation: this, code }
        }, 'Error in onAction interface'
      ) );
    }

    return this.get();
  }

  async _loadInbox() {
    if ( !this.inbox.data ) {
      await this.inbox.get();
    }

    if ( !this.inbox.data ) {
      throw new VError( 'Inbox %j not found', this.inbox.identifiers );
    }
  }

  async _loadConversation() {
    if ( !this.data ) {
      await this.get();
    }

    if ( !this.data ) {
      throw new VError( 'Conversation %j not found', this.identifiers );
    }
  }

  async _getInboxUser( identifiers ) {
    const inboxUser = await this.inbox.users.get( identifiers );

    if ( !inboxUser.data ) {
      throw new VError( 'InboxUser %j not found in Inbox %j', identifiers, this.inbox.identifiers );
    }

    return inboxUser;
  }

  toJSON() {
    if ( !this.data ) {
      return null;
    }

    return this.data;
  }
}
